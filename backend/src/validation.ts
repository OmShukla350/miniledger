import { z } from 'zod';

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid phone number with country code');

export const requestOtpSchema = z.object({ phone: phoneSchema });
export const verifyOtpSchema = z.object({ phone: phoneSchema, otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits') });

const isRealDate = (s: string) => {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const loanSchema = z.object({
  friendName: z.string().trim().min(1, 'Friend name is required').max(100),
  // multipart/form-data sends strings, so coerce
  amount: z.coerce
    .number()
    .positive('Amount must be greater than 0')
    .max(10_000_000, 'Amount too large')
    .refine((v) => Math.round(v * 100) / 100 === v, 'At most 2 decimal places'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine(isRealDate, 'Invalid date'),
});

export const idSchema = z.string().uuid();
