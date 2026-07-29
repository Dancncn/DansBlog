export const getNavLinks = (base: string) => [
	{ href: `${base}`, label: '首页' },
	{ href: `${base}blog/`, label: '博客' },
	{ href: `${base}tags/`, label: '标签' },
	{ href: `${base}links/`, label: '友链' },
	{ href: `${base}about/`, label: '关于' },
];
