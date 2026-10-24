import request from 'supertest';
import { app } from '../app';

// These hit only validation/auth layers, so no database is required.
describe('API guards', () => {
  it('health', async () => expect((await request(app).get('/health')).body).toEqual({ ok: true }));
  it('rejects bad phone on request-otp', async () => {
    const r = await request(app).post('/auth/request-otp').send({ phone: '12' });
    expect(r.status).toBe(400);
  });
  it.each(['/loans', '/summary'])('requires a token for %s', async (p) => {
    expect((await request(app).get(p)).status).toBe(401);
  });
  it('rejects garbage token', async () => {
    expect((await request(app).get('/loans').set('Authorization', 'Bearer nope')).status).toBe(401);
  });
});
