import type { User } from './lib/auth';

declare global {
	interface Window {
		__API_BASE: string;
		__TOKEN_KEY: string;
		__auth: {
			storeTokenFromHash: () => string | null;
			getAuthToken: () => string | null;
			getCurrentUser: () => Promise<User | null>;
			logout: () => Promise<void>;
		};
		__formatFullViewCount?: (count: number) => string;
		__formatCompactViewCount?: (count: number) => string;
		__tocCleanup?: (() => void) | null;
		__tocFadeCleanup?: (() => void) | null;
		__imgLightboxBound?: boolean;
		__backToTopIdle?: number;
		__backToTopSchedule?: () => void;
		__backToTopScrollBound?: boolean;
		__blogPostEventsBound?: boolean;
	}
}
