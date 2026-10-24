import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware';
import { authRouter } from './routes/auth';
import { loansRouter } from './routes/loans';
import { summaryRouter } from './routes/summary';

export const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/loans', loansRouter);
app.use('/summary', summaryRouter);
app.use(errorHandler);
