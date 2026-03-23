// Dynamically determine API base based on current host
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = isLocalhost ? 'http://localhost:8787' : 'https://api.danarnoux.com';
const TOKEN_KEY = 'blog_token';

// Store on window to avoid redeclaration issues
if (typeof window !== 'undefined') {
	window.__API_BASE = API_BASE;
	window.__TOKEN_KEY = TOKEN_KEY;
}

function readHashToken() {
	if (typeof window === 'undefined') return null;
	const hash = window.location.hash || '';
	const match = hash.match(/(?:^#|&)token=([^&]+)/);
	if (!match) return null;
	try {
		return decodeURIComponent(match[1]);
	} catch {
		return match[1];
	}
}

function storeTokenFromHash() {
	if (typeof window === 'undefined') return null;
	const token = readHashToken();
	if (!token) return null;
	localStorage.setItem(TOKEN_KEY, token);
	history.replaceState(null, '', window.location.pathname);
	return token;
}

function getAuthToken() {
	if (typeof window === 'undefined') return null;
	storeTokenFromHash();
	return localStorage.getItem(TOKEN_KEY);
}

async function getCurrentUser() {
	const token = getAuthToken();
	if (!token) return null;

	const response = await fetch(`${API_BASE}/api/me`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			localStorage.removeItem(TOKEN_KEY);
		}
		return null;
	}

	const data = await response.json();
	const user = data?.user ?? data ?? null;
	if (!user || typeof user !== 'object') return null;

	return {
		id: user.id ?? '',
		username: user.username ?? user.login ?? user.name ?? '',
		avatar: user.avatar ?? user.avatarUrl ?? user.avatar_url ?? '',
	};
}

async function logout() {
	const token = getAuthToken();
	if (!token) {
		localStorage.removeItem(TOKEN_KEY);
		return;
	}

	try {
		await fetch(`${API_BASE}/api/auth/logout`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	} finally {
		localStorage.removeItem(TOKEN_KEY);
	}
}

// Attach to window for global access
if (typeof window !== 'undefined') {
	window.__auth = {
		storeTokenFromHash,
		getAuthToken,
		getCurrentUser,
		logout,
	};
}
