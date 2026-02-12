export type FriendLink = {
	name: string;
	url: string;
	kind: 'github' | 'bilibili' | 'project';
	github?: string;
	bilibili?: string;
	type?: 'github' | 'bilibili';
	avatar?: string;
	description?: string;
	tags?: string[];
	status?: 'active' | 'inactive';
};

export const links: FriendLink[] = [
	{
		name: 'DanArnoux',
		kind: 'github',
		github: 'Dancncn',
		url: 'https://github.com/Dancncn',
		bilibili: 'https://space.bilibili.com/435440676',
		description:
			'Engineer and researcher-in-training, sharing research notes, technical essays, and practical engineering workflows.',
		tags: ['Research', 'Engineering', 'Notes'],
		status: 'active',
	},
	{
		name: 'CreatInf',
		kind: 'project',
		url: 'https://creatinf.com/',
		description: 'AI-assisted creative engineering tools and practical workflows.',
		tags: ['Project', 'AI', 'Tools'],
		status: 'active',
	},
	{
		name: 'Licyk',
		kind: 'github',
		github: 'licyk',
		url: 'https://licyk.netlify.app/',
		description: 'Builds AI art tooling and automation around Stable Diffusion and image workflows.',
		tags: ['AI', 'Tools', 'Scripts'],
		status: 'active',
	},
	{
		name: 'Herbert Skyper',
		kind: 'github',
		github: 'herbertskyper',
		url: 'https://www.skyper.site/',
		description:
			'Interested in AI and operating systems; currently exploring databases, server systems, and high-performance computing.',
		tags: ['AI', 'OS', 'HPC'],
		status: 'active',
	},
	{
		name: 'nix',
		kind: 'github',
		github: 'Nixdorfer',
		url: 'https://github.com/Nixdorfer',
		description:
			'All-round developer with early BSc & MSc degrees in Germany, strong in CS and physics, now focused on AI tooling.',
		tags: ['AI', 'Full-Stack', 'Systems'],
		status: 'active',
	},
	{
		name: 'kirintea',
		kind: 'github',
		url: 'https://github.com/kirintea',
		github: 'kirintea',
		description:
			'Focused on AI model training and Stable Diffusion. Published multiple community-adopted models with high download counts.',
		tags: ['AI', 'Model Training', 'Stable Diffusion', 'Models'],
		status: 'active',
	},
	{
		name: '似镜流年',
		kind: 'bilibili',
		url: 'https://space.bilibili.com/518374328',
		type: 'bilibili',
		avatar: '/image/bili/sijingliunian.jpg',
		description: 'Arknights strategy creator focusing on low-cost and easy-to-follow clear guides.',
		tags: ['Bilibili', 'Arknights', 'Strategy'],
		status: 'active',
	},
	{
		name: '防御老猫',
		kind: 'bilibili',
		url: 'https://space.bilibili.com/3546757950605988',
		type: 'bilibili',
		avatar: '/image/bili/fangyulaomao.jpg',
		description: 'Anime-themed edits and emotional short-form videos.',
		tags: ['Bilibili', 'Anime', 'Edits'],
		status: 'active',
	},
	{
		name: '白色孤离',
		kind: 'bilibili',
		url: 'https://space.bilibili.com/178692716',
		type: 'bilibili',
		avatar: '/image/bili/baiseguli.jpg',
		description: 'MAD and anime edit creator with high-production fan works.',
		tags: ['Bilibili', 'MAD', 'Anime'],
		status: 'active',
	},
	{
		name: '茉莉间雨奏',
		kind: 'bilibili',
		url: 'https://space.bilibili.com/503991648?spm_id_from=333.337.0.0',
		type: 'bilibili',
		avatar: '/image/bili/molijianyuzou.jpg',
		description: 'Bilibili creator.',
		tags: ['Bilibili'],
		status: 'active',
	},
	{
		name: 'uiuiuiui8',
		kind: 'bilibili',
		url: '',
		type: 'bilibili',
		avatar: '/image/bili/uiuiuiui8.jpg',
		description: 'AI model training and 3D printing research.',
		tags: ['AI', 'Machine Learning', '3D Printing'],
		status: 'active',
	},
	{
		name: 'Ruhui Chen',
		kind: 'github',
		url: 'https://github.com/wbsxhh201771',
		github: 'wbsxhh201771',
		description:
			'Private developer with enterprise and public-sector experience. Most work is self-hosted and not publicly mirrored on GitHub.',
		tags: ['Enterprise', 'Private Projects', 'Backend'],
		status: 'active',
	},
	{
		name: 'fumigo',
		kind: 'project',
		url: 'https://fumigo.cn/',
		description: 'A Japanese learning website that applies AI to personalize the learning experience.',
		tags: ['Japanese', 'AI', 'Personalization'],
		status: 'active',
	},
];