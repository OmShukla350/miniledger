import crypto from 'crypto';
import { config } from './config';

export const generateOtp = () => String(crypto.randomInt(100000, 1000000));

export const hashOtp = (phone: string, otp: string) =>
  crypto.createHmac('sha256', config.otpSecret).update(`${phone}:${otp}`).digest('hex');

export const otpMatches = (phone: string, otp: string, storedHash: string) => {
  const a = Buffer.from(hashOtp(phone, otp), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
