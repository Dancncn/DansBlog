import { API_BASE } from './config';
import { getToken } from './auth';

// The Worker verifies the blog session or an Access identity supplied by Cloudflare.
// Browsers must never invent CF-Access identity headers.
function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
	const headers = new Headers(options.headers);
	const token = getToken();
	if (token) headers.set('Authorization', `Bearer ${token}`);
	return fetch(url, { ...options, headers, credentials: 'include' });
}

export interface AdminStats {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
}

export interface AdminComment {
	id: string;
	post_slug: string;
	body: string;
	status: 'pending' | 'approved' | 'rejected';
	created_at: number;
	updated_at: number;
	login: string;
	name: string | null;
	avatar_url: string | null;
}

export async function getAdminStats(): Promise<AdminStats> {
	const res = await adminFetch(`${API_BASE}/api/admin/stats`);
	if (!res.ok) throw new Error('Failed to fetch stats');
	return res.json();
}

export async function getAdminComments(status?: string): Promise<{ comments: AdminComment[] }> {
	const url = new URL(`${API_BASE}/api/admin/comments`);
	if (status && status !== 'all') url.searchParams.set('status', status);
	const res = await adminFetch(url.toString());
	if (!res.ok) throw new Error('Failed to fetch comments');
	return res.json();
}

export async function approveComment(id: string): Promise<{ success: boolean }> {
	const res = await adminFetch(`${API_BASE}/api/admin/comment/approve`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ id })
	});
	if (!res.ok) throw new Error('Failed to approve comment');
	return res.json();
}

export async function rejectComment(id: string): Promise<{ success: boolean }> {
	const res = await adminFetch(`${API_BASE}/api/admin/comment/reject`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ id })
	});
	if (!res.ok) throw new Error('Failed to reject comment');
	return res.json();
}

export async function deleteComment(id: string): Promise<{ success: boolean }> {
	const res = await adminFetch(`${API_BASE}/api/admin/comment?id=${encodeURIComponent(id)}`, {
		method: 'DELETE',
	});
	if (!res.ok) throw new Error('Failed to delete comment');
	return res.json();
}

export async function checkAdmin(): Promise<{ isAdmin: boolean; email: string | null }> {
	// Send the actual session token and allow Cloudflare Access cookies when present.
	try {
		const res = await adminFetch(`${API_BASE}/api/admin/check`);
		if (!res.ok) return { isAdmin: false, email: null };
		return res.json();
	} catch {
		return { isAdmin: false, email: null };
	}
}
