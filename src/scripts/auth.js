const API_BASE = 'https://api.danarnoux.com';
const TOKEN_KEY = 'blog_token';

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

export function getAuthToken() {
	if (typeof window === 'undefined') return null;
	storeTokenFromHash();
	return localStorage.getItem(TOKEN_KEY);
}

export async function getCurrentUser() {
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

export async function logout() {
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

export async function initAuthUI() {
	if (typeof window === 'undefined' || typeof document === 'undefined') return;
	storeTokenFromHash();

	const loginButton = document.querySelector('[data-auth-login]');
	const userWrap = document.querySelector('[data-auth-user]');
	const avatarEl = document.querySelector('[data-auth-avatar]');
	const nameEl = document.querySelector('[data-auth-name]');
	const logoutButton = document.querySelector('[data-auth-logout]');

	const showLoggedOut = () => {
		if (loginButton instanceof HTMLElement) loginButton.classList.remove('hidden');
		if (userWrap instanceof HTMLElement) userWrap.classList.add('hidden');
	};

	const showLoggedIn = (user) => {
		if (loginButton instanceof HTMLElement) loginButton.classList.add('hidden');
		if (userWrap instanceof HTMLElement) userWrap.classList.remove('hidden');
		if (avatarEl instanceof HTMLImageElement) {
			avatarEl.src = user.avatar || '/image/DanArnoux.jpg';
			avatarEl.alt = `${user.username || 'User'} avatar`;
		}
		if (nameEl instanceof HTMLElement) {
			nameEl.textContent = user.username || 'User';
		}
	};

	const user = await getCurrentUser();
	if (!user) {
		showLoggedOut();
	} else {
		showLoggedIn(user);
	}

	if (logoutButton instanceof HTMLButtonElement && logoutButton.dataset.bound !== 'true') {
		logoutButton.dataset.bound = 'true';
		logoutButton.addEventListener('click', async () => {
			await logout();
			showLoggedOut();
		});
	}
}
