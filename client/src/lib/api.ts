export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const FETCH_OPTS: RequestInit = { credentials: 'include' };

export type User = { id: number; email: string };
export type Thread = { id: number; title: string; created_at: string };
export type Message = { id: number; role: string; content: string };
