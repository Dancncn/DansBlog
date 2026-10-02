import { API_BASE } from './config';

let activeViewsRoot: HTMLElement | null = null;

const scrollToTopIfNoHash = () => {
	// Manual restoration prevents stale scroll positions when View Transitions swap pages.
	try {
		if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
	} catch {}
	if (!window.location.hash) {
		requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0)));
	}
};

const initTocActiveState = () => {
	// Clean and re-bind because Astro swaps DOM without a full page refresh.
	if (typeof window.__tocCleanup === 'function') {
		window.__tocCleanup();
		window.__tocCleanup = null;
	}

	// Get ALL TOC links from both sidebar and drawer (not scoped to viewport).
	const links = Array.from(document.querySelectorAll<HTMLElement>('[data-toc-link]'));
	const headings = Array.from(
		document.querySelectorAll('.markdown-prose h2[id], .markdown-prose h3[id], .markdown-prose h4[id]')
	);

	if (links.length === 0 || headings.length === 0) return;

	const ACTIVE_CLASSES = [
		'bg-zinc-100/55',
		'text-zinc-900',
		'border-zinc-400/90',
		'dark:bg-zinc-800/55',
		'dark:text-zinc-100',
		'dark:border-zinc-500/90',
	];

	// Helper: normalize heading ID for matching (decode URL-encoded IDs).
	const normalizeId = (id: string) => {
		try {
			return decodeURIComponent(id);
		} catch {
			return id;
		}
	};

	// Map heading id -> all matching TOC links (both sidebar and drawer)
	// Use normalized (decoded) IDs for matching with heading.id
	const linkMap = new Map<string, HTMLElement[]>();
	for (const link of links) {
		const rawId = link.dataset.tocLink || '';
		if (!rawId) continue;
		const id = normalizeId(rawId);
		const group = linkMap.get(id) || [];
		group.push(link);
		linkMap.set(id, group);
	}

	const clearActive = () => {
		for (const link of links) {
			link.classList.remove(...ACTIVE_CLASSES);
			link.removeAttribute('aria-current');
		}
	};

	const isElementVisible = (element: Element) => {
		if (!(element instanceof Element)) return false;
		if (element.getClientRects().length === 0) return false;
		const style = window.getComputedStyle(element);
		return style.display !== 'none' && style.visibility !== 'hidden';
	};

	// Scroll TOC link into view within its container (if container exists).
	const ensureVisibleInToc = (link: HTMLElement) => {
		const container = link.closest('[data-toc-scroll]');
		if (!container) return;
		if (!isElementVisible(link) || !isElementVisible(container)) return;
		const cRect = container.getBoundingClientRect();
		const eRect = link.getBoundingClientRect();
		if (eRect.top < cRect.top || eRect.bottom > cRect.bottom) {
			link.scrollIntoView({ block: 'nearest' });
		}
	};

	// Set active state for ALL matching links (sidebar + drawer).
	const setActive = (id: string) => {
		clearActive();
		if (!id) return;
		const normalizedId = normalizeId(id);
		const group = linkMap.get(normalizedId) || [];
		for (const link of group) {
			link.classList.add(...ACTIVE_CLASSES);
			link.setAttribute('aria-current', 'true');
			ensureVisibleInToc(link);
		}
	};

	// Use IntersectionObserver to detect which heading is currently visible.
	let observer: IntersectionObserver | null = null;
	let rafId = 0;
	let currentId = '';

	const updateActive = () => {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			// Find the first heading that is in the visible viewport area.
			let newId = '';
			for (const heading of headings) {
				const rect = heading.getBoundingClientRect();
				// Heading is "active" when its top is near the top of viewport.
				if (rect.top <= 140) {
					newId = heading.id;
				}
			}
			// Also check if the first heading is below viewport (edge case).
			if (!newId && headings[0]) {
				const firstRect = headings[0].getBoundingClientRect();
				if (firstRect.top > 140) {
					newId = headings[0].id;
				}
			}
			if (newId && newId !== currentId) {
				currentId = newId;
				setActive(newId);
			}
		});
	};

	const syncVisibleTocActive = () => {
		if (currentId && linkMap.has(normalizeId(currentId))) {
			setActive(currentId);
			return;
		}
		updateActive();
	};

	// Try to use IntersectionObserver first (more accurate).
	try {
		observer = new IntersectionObserver(
			(entries) => {
				// Find the topmost visible heading.
				let topmost = null;
				let topmostTop = Infinity;
				for (const entry of entries) {
					if (entry.isIntersecting && entry.target.getBoundingClientRect().top < topmostTop) {
						topmost = entry.target;
						topmostTop = entry.target.getBoundingClientRect().top;
					}
				}
				if (topmost) {
					const newId = topmost.id;
					if (newId !== currentId) {
						currentId = newId;
						setActive(newId);
					}
				}
			},
			{
				rootMargin: '-140px 0px -60% 0px',
				threshold: 0
			}
		);

		headings.forEach((heading) => {
			if (heading.id) observer?.observe(heading);
		});
	} catch (e) {
		// Fallback to scroll listener if IntersectionObserver fails.
		window.addEventListener('scroll', updateActive, { passive: true });
	}

	const onHashChange = () => {
		const hashId = window.location.hash.replace(/^#/, '');
		const id = normalizeId(hashId);
		if (id && linkMap.has(id)) {
			currentId = id;
			setActive(id);
		}
	};

	window.addEventListener('resize', updateActive);
	window.addEventListener('hashchange', onHashChange);
	window.addEventListener('toc:sync-active', syncVisibleTocActive);

	// Set initial active heading based on URL hash or scroll position.
	const rawHashId = window.location.hash.replace(/^#/, '');
	const hashId = normalizeId(rawHashId);
	if (hashId && linkMap.has(hashId)) {
		currentId = hashId;
		setActive(hashId);
	} else if (!observer) {
		// No observer, manually check scroll position.
		updateActive();
	}

	window.__tocCleanup = () => {
		if (rafId) cancelAnimationFrame(rafId);
		if (observer) {
			observer.disconnect();
			observer = null;
		}
		window.removeEventListener('scroll', updateActive);
		window.removeEventListener('resize', updateActive);
		window.removeEventListener('hashchange', onHashChange);
		window.removeEventListener('toc:sync-active', syncVisibleTocActive);
	};
};

const initTocScrollFades = () => {
	// Fades are computed from scroll state to hint overflow without extra permanent chrome.
	if (typeof window.__tocFadeCleanup === 'function') {
		window.__tocFadeCleanup();
		window.__tocFadeCleanup = null;
	}

	// Only initialize fade effects for the current viewport's TOC container.
	const isMobile = window.innerWidth < 768;
	const tocContainer = document.querySelector(isMobile ? '[data-toc="drawer"]' : '[data-toc="sidebar"]');
	if (!tocContainer) return;

	const wrap = tocContainer.querySelector('[data-toc-fade-wrap]');
	const wraps = wrap ? [wrap] : [];
	if (wraps.length === 0) return;

	const cleanups: (() => void)[] = [];
	const updateFns: (() => void)[] = [];
	const EPS = 1;

	for (const wrap of wraps) {
		const container = wrap.querySelector('[data-toc-scroll]');
		const topFade = wrap.querySelector('[data-toc-fade="top"]');
		const bottomFade = wrap.querySelector('[data-toc-fade="bottom"]');
		if (!container || !topFade || !bottomFade) continue;
		let rafId = 0;

		const applyFadeState = () => {
			rafId = 0;
			const canScroll = container.scrollHeight - container.clientHeight > EPS;
			if (!canScroll) {
				topFade.classList.add('opacity-0');
				topFade.classList.remove('opacity-100');
				bottomFade.classList.add('opacity-0');
				bottomFade.classList.remove('opacity-100');
				return;
			}

			const showTop = container.scrollTop > EPS;
			const showBottom = container.scrollTop + container.clientHeight < container.scrollHeight - EPS;

			topFade.classList.toggle('opacity-100', showTop);
			topFade.classList.toggle('opacity-0', !showTop);
			bottomFade.classList.toggle('opacity-100', showBottom);
			bottomFade.classList.toggle('opacity-0', !showBottom);
		};

		const scheduleFadeUpdate = () => {
			if (rafId) return;
			rafId = requestAnimationFrame(applyFadeState);
		};

		container.addEventListener('scroll', scheduleFadeUpdate, { passive: true });
		cleanups.push(() => {
			container.removeEventListener('scroll', scheduleFadeUpdate);
			if (rafId) cancelAnimationFrame(rafId);
		});
		updateFns.push(applyFadeState);
		applyFadeState();
	}

	const refreshAll = () => {
		for (const update of updateFns) update();
	};

	window.addEventListener('resize', refreshAll);
	window.addEventListener('toc:refresh', refreshAll);
	cleanups.push(() => window.removeEventListener('resize', refreshAll));
	cleanups.push(() => window.removeEventListener('toc:refresh', refreshAll));

	window.__tocFadeCleanup = () => {
		for (const fn of cleanups) fn();
	};
};

const initImageLightbox = () => {
	// Bind once globally; route swaps re-render nodes but should not duplicate listeners.
	if (window.__imgLightboxBound) return;
	window.__imgLightboxBound = true;

	let lockedScrollY = 0;
	const bodyStyleBeforeLock = {
		position: '',
		top: '',
		left: '',
		right: '',
		width: '',
		overflow: '',
	};
	let isBodyLocked = false;
	let closeTimer: number | undefined;

	const getLightboxElements = () => {
		const overlay = document.getElementById('img-lightbox');
		const target = document.getElementById('img-lightbox-target');
		const caption = document.getElementById('img-lightbox-caption');
		return { overlay, target, caption };
	};

	const closeLightbox = (immediate = false) => {
		const { overlay, target, caption } = getLightboxElements();
		if (!overlay || !target || overlay.classList.contains('hidden')) return;
		if (!immediate && overlay.classList.contains('is-closing')) return;
		if (closeTimer !== undefined) window.clearTimeout(closeTimer);

		const finishClose = () => {
			closeTimer = undefined;
			overlay.classList.add('hidden');
			overlay.classList.remove('flex', 'is-closing');
			overlay.setAttribute('aria-hidden', 'true');
			target.setAttribute('src', '');
			target.setAttribute('alt', '');
			if (caption) caption.textContent = '';

			if (isBodyLocked) {
				document.body.style.position = bodyStyleBeforeLock.position;
				document.body.style.top = bodyStyleBeforeLock.top;
				document.body.style.left = bodyStyleBeforeLock.left;
				document.body.style.right = bodyStyleBeforeLock.right;
				document.body.style.width = bodyStyleBeforeLock.width;
				document.body.style.overflow = bodyStyleBeforeLock.overflow;
				window.scrollTo(0, lockedScrollY);
				isBodyLocked = false;
			}
		};

		// Brief fade-out unless the user prefers reduced motion.
		if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			finishClose();
			return;
		}
		overlay.classList.add('is-closing');
		closeTimer = window.setTimeout(finishClose, 180);
	};

	const openLightbox = (src: string, altText: string) => {
		const { overlay, target, caption } = getLightboxElements();
		if (!overlay || !target || !src) return;
		if (caption) caption.textContent = altText || '';

		if (!isBodyLocked) {
			lockedScrollY = window.scrollY;
			bodyStyleBeforeLock.position = document.body.style.position;
			bodyStyleBeforeLock.top = document.body.style.top;
			bodyStyleBeforeLock.left = document.body.style.left;
			bodyStyleBeforeLock.right = document.body.style.right;
			bodyStyleBeforeLock.width = document.body.style.width;
			bodyStyleBeforeLock.overflow = document.body.style.overflow;
			document.body.style.position = 'fixed';
			document.body.style.top = `-${lockedScrollY}px`;
			document.body.style.left = '0';
			document.body.style.right = '0';
			document.body.style.width = '100%';
			document.body.style.overflow = 'hidden';
			isBodyLocked = true;
		}

		target.setAttribute('src', src);
		target.setAttribute('alt', altText || '');
		overlay.classList.remove('hidden');
		overlay.classList.add('flex');
		overlay.setAttribute('aria-hidden', 'false');
	};

	document.addEventListener('click', (event) => {
		const rawTarget = event.target;
		if (!(rawTarget instanceof Element)) return;

		const { overlay } = getLightboxElements();
		if (overlay && !overlay.classList.contains('hidden')) {
			// Any click inside the open lightbox dismisses it (image included).
			if (overlay.contains(rawTarget)) {
				event.preventDefault();
				closeLightbox();
				return;
			}
		}

		if (!(rawTarget instanceof HTMLImageElement)) return;
		if (!rawTarget.closest('.markdown-prose')) return;

		const anchor = rawTarget.closest('a');
		if (anchor) event.preventDefault();

		const imgSrc = rawTarget.currentSrc || rawTarget.src;
		if (!imgSrc) return;
		openLightbox(imgSrc, rawTarget.alt || '');
	});

	document.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') return;
		closeLightbox();
	});
	document.addEventListener('astro:before-swap', () => closeLightbox(true));
};

const resetPageScrollLocks = () => {
	// Defensive unlock protects against interrupted lightbox flows during route changes.
	document.documentElement.classList.remove('overflow-hidden');
	const topOffset = Number.parseInt(document.body.style.top || '0', 10);
	const shouldRestoreBody = document.body.style.position === 'fixed';
	if (!shouldRestoreBody) return;
	document.body.style.position = '';
	document.body.style.top = '';
	document.body.style.left = '';
	document.body.style.right = '';
	document.body.style.width = '';
	document.body.style.overflow = '';
	if (!Number.isNaN(topOffset) && topOffset < 0) {
		window.scrollTo(0, Math.abs(topOffset));
	}
};

const initBackToTop = () => {
	const button = document.querySelector('[data-back-to-top]');
	if (!(button instanceof HTMLElement)) return;

	const ring = button.querySelector('[data-back-to-top-progress]');
	const circumference = 2 * Math.PI * 21;
	if (ring instanceof SVGElement) {
		ring.style.strokeDasharray = String(circumference);
		ring.style.strokeDashoffset = String(circumference);
	}

	let rafId = 0;
	const update = () => {
		rafId = 0;
		const doc = document.documentElement;
		const max = Math.max(1, doc.scrollHeight - window.innerHeight);
		const progress = Math.min(1, Math.max(0, window.scrollY / max));
		// Surface while scrolling; fade out 3s after scrolling stops, unless
			// the pointer/focus is holding it (tracked via data-held).
			if (window.scrollY > 480) {
				button.classList.add('is-visible');
				if (window.__backToTopIdle) clearTimeout(window.__backToTopIdle);
				window.__backToTopIdle = window.setTimeout(() => {
					window.__backToTopIdle = 0;
					if (button.dataset.held !== 'true') button.classList.remove('is-visible');
				}, 3000);
			} else {
				if (window.__backToTopIdle) { clearTimeout(window.__backToTopIdle); window.__backToTopIdle = 0; }
				button.classList.remove('is-visible');
			}
		if (ring instanceof SVGElement) {
			ring.style.strokeDashoffset = String(circumference * (1 - progress));
		}
	};
	const schedule = () => {
		if (!rafId) rafId = requestAnimationFrame(update);
	};

	if (button.dataset.bound !== 'true') {
		button.dataset.bound = 'true';
			// Hover/focus holds the button visible so it never vanishes mid-reach.
			const holdBackToTop = () => {
				button.dataset.held = 'true';
				if (window.__backToTopIdle) { clearTimeout(window.__backToTopIdle); window.__backToTopIdle = 0; }
				if (window.scrollY > 480) button.classList.add('is-visible');
			};
			const releaseBackToTop = () => {
				button.dataset.held = 'false';
				if (window.scrollY > 480) {
					if (window.__backToTopIdle) clearTimeout(window.__backToTopIdle);
					window.__backToTopIdle = window.setTimeout(() => {
						window.__backToTopIdle = 0;
						if (button.dataset.held !== 'true') button.classList.remove('is-visible');
					}, 3000);
				}
			};
			button.addEventListener('pointerenter', holdBackToTop);
			button.addEventListener('focusin', holdBackToTop);
			button.addEventListener('pointerleave', releaseBackToTop);
			button.addEventListener('focusout', releaseBackToTop);
		button.addEventListener('click', () => {
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
		});
	}

	// Scroll/resize listeners bind once and dispatch to the current page's handler.
	window.__backToTopSchedule = schedule;
	if (window.__backToTopScrollBound !== true) {
		window.__backToTopScrollBound = true;
		const dispatch = () => {
			if (typeof window.__backToTopSchedule === 'function') window.__backToTopSchedule();
		};
		window.addEventListener('scroll', dispatch, { passive: true });
		window.addEventListener('resize', dispatch);
	}
	update();
};

const onPostPageLoad = () => {
	// Centralize post-page bootstrapping so astro:page-load and astro:after-swap stay identical.
	if (!document.querySelector('.blog-post-page')) {
		window.__tocCleanup?.();
		window.__tocFadeCleanup?.();
		window.__backToTopSchedule = undefined;
		activeViewsRoot = null;
		return;
	}
	resetPageScrollLocks();
	scrollToTopIfNoHash();
	initTocActiveState();
	initTocScrollFades();
	initImageLightbox();
	initBackToTop();
	loadPostViews();
	loadRelatedPostViews();
	initCodeBlocks();
};

const formatViewCount = window.__formatFullViewCount || function(c) { var v = Number(c); return (!Number.isFinite(v) || v < 0) ? '0 views' : v.toLocaleString('en-US') + ' ' + (v === 1 ? 'view' : 'views'); };
const formatCompactViewCount = window.__formatCompactViewCount || function(c) { var v = Number(c); return (!Number.isFinite(v) || v < 0) ? '0' : v >= 1000 ? (v/1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : v.toLocaleString('en-US'); };

const loadPostViews = async () => {
	const root = document.querySelector('[data-post-views-root]');
	const output = document.querySelector('[data-post-views]');
	if (!(root instanceof HTMLElement) || !(output instanceof HTMLElement)) return;

	const slug = root.dataset.postViewsRoot || '';
	if (!slug) {
		output.textContent = '0 views';
		return;
	}

	// A new DOM root needs its count populated even when returning to the same article.
	if (activeViewsRoot === root) return;
	activeViewsRoot = root;

	const apiBase = API_BASE;
	const sessionKey = `blog_viewed:${slug}`;
	const hasViewedInSession = (() => {
		try {
			return sessionStorage.getItem(sessionKey) === '1';
		} catch {
			return false;
		}
	})();

	try {
		const response = hasViewedInSession
			? await fetch(`${apiBase}/api/views?post=${encodeURIComponent(slug)}`)
			: await fetch(`${apiBase}/api/views`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ post: slug }),
				});

		if (response.ok) {
			const data = await response.json();
			if (!hasViewedInSession) {
				try {
					sessionStorage.setItem(sessionKey, '1');
				} catch {}
			}
			output.textContent = formatViewCount(data?.views ?? 0);
			return;
		}
	} catch {}

	try {
		const fallback = await fetch(`${apiBase}/api/views?post=${encodeURIComponent(slug)}`);
		if (!fallback.ok) throw new Error('views_get_failed');
		const data = await fallback.json();
		output.textContent = formatViewCount(data?.views ?? 0);
	} catch {
		output.textContent = '0 views';
	}
};

const loadRelatedPostViews = async () => {
	const roots = Array.from(document.querySelectorAll('[data-related-post-views-root]'));
	if (!roots.length) return;

	const apiBase = API_BASE;
	const uniqueKeys = [...new Set(
		roots
			.map((root) => root.getAttribute('data-related-post-views-root') || '')
			.filter(Boolean)
	)];

	await Promise.all(uniqueKeys.map(async (key) => {
		let text = '0';
		try {
			const response = await fetch(`${apiBase}/api/views?post=${encodeURIComponent(key)}`);
			if (response.ok) {
				const data = await response.json();
				text = formatCompactViewCount(data?.views ?? 0);
			}
		} catch {}

		document
			.querySelectorAll(`[data-related-post-views-root="${key}"] [data-related-post-views]`)
			.forEach((node) => {
				node.textContent = text;
			});
	}));
};

// Code block enhancements (copy button, fold)
const initCodeBlocks = () => {
	const CONFIG = { maxHeight: 400, copyTimeout: 2000 };
	const setCodeActionsVisible = (pre: HTMLElement, visible: boolean) => {
		if (!(pre instanceof HTMLElement)) return;
		pre.dataset.codeActionsVisible = visible ? 'true' : 'false';
	};
	const preEls = document.querySelectorAll<HTMLPreElement>('.markdown-prose pre');
	preEls.forEach((pre) => {
		if (pre.dataset.codeEnhanced) return;
		pre.dataset.codeEnhanced = 'true';
		pre.dataset.codeActionsVisible = 'false';
		pre.style.position = 'relative';
		const code = pre.querySelector('code');
		const codeText = code?.textContent || '';
		const shouldCollapse = pre.scrollHeight > CONFIG.maxHeight;
		const lang = (pre.className.match(/language-(\w+)/) || ['',''])[1] || (code?.className?.match(/language-(\w+)/) || ['',''])[1] || pre.getAttribute('data-language');
		const langSpan = document.createElement('span');
		langSpan.className = 'code-lang-label';
		langSpan.textContent = lang || '';
		const btn = document.createElement('button');
		btn.className = 'code-copy-btn';
		btn.type = 'button';
		btn.setAttribute('aria-label', 'Copy code');
		btn.innerHTML = '<svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span class="copy-text">Copy</span>';
		const copyText = btn.querySelector<HTMLElement>('.copy-text')!;
		const copyIcon = btn.querySelector<SVGElement>('.copy-icon')!;
		btn.onclick = async (e) => {
			e.preventDefault();
			e.stopPropagation();
			setCodeActionsVisible(pre, true);
			try {
				await navigator.clipboard.writeText(codeText);
				copyText.textContent = 'Copied!';
				copyIcon.innerHTML = '<path d="M20 6L9 17l-5-5"></path>';
				setTimeout(() => {
					copyText.textContent = 'Copy';
					copyIcon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>';
				}, CONFIG.copyTimeout);
			} catch (err) { console.error('Copy failed:', err); }
		};
		const actionBar = document.createElement('div');
		actionBar.className = 'code-action-bar';
		if (lang) actionBar.appendChild(langSpan);
		actionBar.appendChild(btn);
		pre.appendChild(actionBar);

		const showActions = () => setCodeActionsVisible(pre, true);
		const hideActions = () => setCodeActionsVisible(pre, false);
		pre.addEventListener('pointerenter', showActions);
		pre.addEventListener('pointerleave', hideActions);
		pre.addEventListener('focusin', showActions);
		pre.addEventListener('focusout', (event) => {
			if (event.relatedTarget instanceof Node && pre.contains(event.relatedTarget)) return;
			hideActions();
		});
		pre.addEventListener('click', (event) => {
			if (!(event.target instanceof Element)) return;
			if (event.target.closest('.code-copy-btn, .code-expand-btn')) return;
			showActions();
		});
		if (shouldCollapse) {
			pre.style.maxHeight = CONFIG.maxHeight + 'px';
			pre.style.overflow = 'hidden';
			const expBtn = document.createElement('button');
			expBtn.className = 'code-expand-btn';
			expBtn.type = 'button';
			expBtn.setAttribute('data-expanded', 'false');
			expBtn.textContent = 'Expand Code';
			let expanded = false;
			expBtn.onclick = (e) => {
				e.preventDefault();
				e.stopPropagation();
				expanded = !expanded;
				pre.style.maxHeight = expanded ? 'none' : CONFIG.maxHeight + 'px';
				pre.style.overflowX = 'auto';
				pre.style.overflowY = expanded ? 'auto' : 'hidden';
				expBtn.setAttribute('data-expanded', String(expanded));
				expBtn.textContent = expanded ? 'Collapse' : 'Expand Code';
				setCodeActionsVisible(pre, true);
			};
			pre.appendChild(expBtn);
		}
	});
};

onPostPageLoad();

if (!window.__blogPostEventsBound) {
	document.addEventListener('astro:page-load', onPostPageLoad);
	document.addEventListener('astro:after-swap', onPostPageLoad);
	window.__blogPostEventsBound = true;
}
