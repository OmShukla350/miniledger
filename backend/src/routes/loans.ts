import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import { config } from '../config';
import { pool } from '../db';
import { ah, requireAuth } from '../middleware';
import { idSchema, loanSchema } from '../validation';

export const loansRouter = Router();
loansRouter.use(requireAuth);

const uploadDir = path.resolve(config.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + (ALLOWED[file.mimetype] ?? '')),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => (ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error('INVALID_FILE_TYPE'))),
});

const COLS = `id, friend_name AS "friendName", amount, due_date AS "dueDate", repaid_at AS "repaidAt",
  (receipt_path IS NOT NULL) AS "hasReceipt", created_at AS "createdAt",
  (repaid_at IS NULL AND due_date < CURRENT_DATE) AS "isOverdue"`;

loansRouter.post('/', upload.single('receipt'), ah(async (req, res) => {
  let data;
  try {
    data = loanSchema.parse(req.body);
  } catch (e) {
    if (req.file) fs.unlink(req.file.path, () => undefined); // don't keep orphaned uploads
    throw e;
  }
  const { rows } = await pool.query(
    `INSERT INTO loans (user_id, friend_name, amount, due_date, receipt_path)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${COLS}`,
    [req.userId, data.friendName, data.amount, data.dueDate, req.file?.filename ?? null],
  );
  res.status(201).json(rows[0]);
}));

loansRouter.get('/', ah(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${COLS} FROM loans WHERE user_id = $1 ORDER BY (repaid_at IS NOT NULL), due_date ASC`,
    [req.userId],
  );
  res.json(rows);
}));

loansRouter.patch('/:id/repaid', ah(async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const { rows } = await pool.query(
    `UPDATE loans SET repaid_at = now() WHERE id = $1 AND user_id = $2 AND repaid_at IS NULL RETURNING ${COLS}`,
    [id, req.userId],
  );
  if (rows[0]) return res.json(rows[0]);
  const exists = await pool.query('SELECT 1 FROM loans WHERE id = $1 AND user_id = $2', [id, req.userId]);
  res.status(exists.rowCount ? 409 : 404).json({ error: exists.rowCount ? 'Already marked as repaid' : 'Loan not found' });
}));

loansRouter.get('/:id/receipt', ah(async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const { rows } = await pool.query('SELECT receipt_path FROM loans WHERE id = $1 AND user_id = $2', [id, req.userId]);
  if (!rows[0]?.receipt_path) return void res.status(404).json({ error: 'Receipt not found' });
  res.sendFile(path.join(uploadDir, path.basename(rows[0].receipt_path)));
}));
