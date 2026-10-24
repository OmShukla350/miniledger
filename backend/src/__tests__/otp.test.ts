import { generateOtp, hashOtp, otpMatches } from '../otp';

it('generates 6-digit codes', () => { for (let i = 0; i < 50; i++) expect(generateOtp()).toMatch(/^\d{6}$/); });
it('verifies only the right code for the right phone', () => {
  const h = hashOtp('+919876543210', '123456');
  expect(otpMatches('+919876543210', '123456', h)).toBe(true);
  expect(otpMatches('+919876543210', '654321', h)).toBe(false);
  expect(otpMatches('+919999999999', '123456', h)).toBe(false);
});
