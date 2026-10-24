import * as SecureStore from 'expo-secure-store';

// Android emulator -> 10.0.2.2 ; iOS simulator -> localhost ; real phone -> your PC's LAN IP
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000';
const TOKEN_KEY = 'miniledger_token';

export type Loan = {
  id: string; friendName: string; amount: number; dueDate: string;
  repaidAt: string | null; hasReceipt: boolean; isOverdue: boolean;
};
export type Summary = { totalLent: number; totalRepaid: number; totalPending: number; overdueAmount: number; overdueCount: number };
export type Receipt = { uri: string; name: string; type: string };

let token: string | null = null;
export const getToken = async () => (token ??= await SecureStore.getItemAsync(TOKEN_KEY));
export const authHeader = () => ({ Authorization: `Bearer ${token}` });
export const saveToken = async (t: string) => { token = t; await SecureStore.setItemAsync(TOKEN_KEY, t); };
export const clearToken = async () => { token = null; await SecureStore.deleteItemAsync(TOKEN_KEY); };

export class UnauthorizedError extends Error {}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...(token ? authHeader() : {}), ...(init.headers as object) } });
  } catch {
    throw new Error(`Cannot reach server at ${API_URL}`);
  }
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 && token) throw new UnauthorizedError('Session expired');
  if (!res.ok) {
    const detail = body.details?.map((d: { message: string }) => d.message).join(', ');
    throw new Error(detail || body.error || 'Something went wrong');
  }
  return body as T;
}

const json = (b: unknown) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });

export const requestOtp = (phone: string) => request<{ message: string }>('/auth/request-otp', json({ phone }));
export const verifyOtp = (phone: string, otp: string) => request<{ token: string }>('/auth/verify-otp', json({ phone, otp }));
export const fetchLoans = () => request<Loan[]>('/loans');
export const fetchSummary = () => request<Summary>('/summary');
export const markRepaid = (id: string) => request<Loan>(`/loans/${id}/repaid`, { method: 'PATCH' });

export function addLoan(f: { friendName: string; amount: string; dueDate: string }, receipt?: Receipt) {
  const form = new FormData();
  form.append('friendName', f.friendName);
  form.append('amount', f.amount);
  form.append('dueDate', f.dueDate);
  if (receipt) form.append('receipt', receipt as unknown as Blob); // RN file descriptor
  return request<Loan>('/loans', { method: 'POST', body: form }); // let fetch set the multipart boundary
}
