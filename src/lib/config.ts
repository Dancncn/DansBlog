// One value for generated links, browser modules, and the legacy window API.
export const API_BASE = (import.meta.env.PUBLIC_API_BASE || (import.meta.env.DEV ? 'http://localhost:8787' : 'https://api.danarnoux.com')).replace(/\/+$/, '');
export const TOKEN_KEY = 'blog_token';
