import { getToken, getUser, logout, storeTokenFromHash } from './auth';
import { API_BASE, TOKEN_KEY } from './config';

// Keep the public interface used by the header and settings during migration.
window.__API_BASE = API_BASE;
window.__TOKEN_KEY = TOKEN_KEY;
window.__auth = {
	storeTokenFromHash,
	getAuthToken: getToken,
	getCurrentUser: getUser,
	logout,
};

storeTokenFromHash();
document.addEventListener('astro:page-load', storeTokenFromHash);
