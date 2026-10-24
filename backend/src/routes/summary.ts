import { Router } from 'express';
import { pool } from '../db';
import { ah, requireAuth } from '../middleware';

export const summaryRouter = Router();

summaryRouter.get('/', requireAuth, ah(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(SUM(amount), 0) AS "totalLent",
       COALESCE(SUM(amount) FILTER (WHERE repaid_at IS NOT NULL), 0) AS "totalRepaid",
       COALESCE(SUM(amount) FILTER (WHERE repaid_at IS NULL), 0) AS "totalPending",
       COALESCE(SUM(amount) FILTER (WHERE repaid_at IS NULL AND due_date < CURRENT_DATE), 0) AS "overdueAmount",
       COUNT(*) FILTER (WHERE repaid_at IS NULL AND due_date < CURRENT_DATE)::int AS "overdueCount"
     FROM loans WHERE user_id = $1`,
    [req.userId],
  );
  res.json(rows[0]);
}));
