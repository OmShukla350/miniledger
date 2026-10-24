import { loanSchema, phoneSchema, verifyOtpSchema } from '../validation';

describe('phone', () => {
  it('accepts E.164-ish numbers', () => expect(phoneSchema.safeParse('+919876543210').success).toBe(true));
  it.each(['123', 'abcdefghijk', '+0123456789012'])('rejects %s', (p) => expect(phoneSchema.safeParse(p).success).toBe(false));
});

describe('otp', () => {
  it('needs exactly 6 digits', () => {
    expect(verifyOtpSchema.safeParse({ phone: '+919876543210', otp: '12345' }).success).toBe(false);
    expect(verifyOtpSchema.safeParse({ phone: '+919876543210', otp: '123456' }).success).toBe(true);
  });
});

describe('loan', () => {
  const ok = { friendName: ' Rahul ', amount: '1500.50', dueDate: '2026-12-31' };
  it('coerces and trims', () => {
    const r = loanSchema.parse(ok);
    expect(r).toEqual({ friendName: 'Rahul', amount: 1500.5, dueDate: '2026-12-31' });
  });
  it.each([
    [{ ...ok, amount: '0' }], [{ ...ok, amount: '-5' }], [{ ...ok, amount: '10.123' }],
    [{ ...ok, friendName: '  ' }], [{ ...ok, dueDate: '2026-02-30' }], [{ ...ok, dueDate: '31/12/2026' }],
  ])('rejects %j', (bad) => expect(loanSchema.safeParse(bad).success).toBe(false));
});
