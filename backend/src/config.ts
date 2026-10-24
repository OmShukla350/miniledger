import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://miniledger:miniledger@localhost:5432/miniledger',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret',
  otpSecret: process.env.OTP_SECRET ?? 'dev-only-otp-secret',
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  otpTtlMs: 5 * 60 * 1000,
  otpResendMs: 30 * 1000,
  otpMaxAttempts: 5,
};
