import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { pool } from '../db';
import { ah } from '../middleware';
import { generateOtp, hashOtp, otpMatches } from '../otp';
import { requestOtpSchema, verifyOtpSchema } from '../validation';

export const authRouter = Router();

authRouter.post('/request-otp', ah(async (req, res) => {
  const { phone } = requestOtpSchema.parse(req.body);

  const existing = await pool.query('SELECT created_at FROM otps WHERE phone = $1', [phone]);
  if (existing.rows[0] && Date.now() - new Date(existing.rows[0].created_at).getTime() < config.otpResendMs) {
    return res.status(429).json({ error: 'Please wait before requesting another OTP' });
  }

  const otp = generateOtp();
  await pool.query(
    `INSERT INTO otps (phone, code_hash, expires_at, attempts, created_at)
     VALUES ($1, $2, $3, 0, now())
     ON CONFLICT (phone) DO UPDATE SET code_hash = $2, expires_at = $3, attempts = 0, created_at = now()`,
    [phone, hashOtp(phone, otp), new Date(Date.now() + config.otpTtlMs)],
  );

  console.log(`[MOCK OTP] ${phone} -> ${otp} (valid 5 min)`); // mock SMS provider
  res.json({ message: 'OTP sent (check the server log)' });
}));

authRouter.post('/verify-otp', ah(async (req, res) => {
  const { phone, otp } = verifyOtpSchema.parse(req.body);

  const { rows } = await pool.query('SELECT code_hash, expires_at, attempts FROM otps WHERE phone = $1', [phone]);
  const row = rows[0];
  if (!row || new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'OTP expired or not requested' });
  if (row.attempts >= config.otpMaxAttempts) return res.status(429).json({ error: 'Too many attempts. Request a new OTP' });

  if (!otpMatches(phone, otp, row.code_hash)) {
    await pool.query('UPDATE otps SET attempts = attempts + 1 WHERE phone = $1', [phone]);
    return res.status(401).json({ error: 'Incorrect OTP' });
  }

  await pool.query('DELETE FROM otps WHERE phone = $1', [phone]); // single use
  const user = await pool.query(
    'INSERT INTO users (phone) VALUES ($1) ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone RETURNING id',
    [phone],
  );
  const token = jwt.sign({ sub: user.rows[0].id }, config.jwtSecret, { expiresIn: '7d' });
  res.json({ token, phone });
}));
