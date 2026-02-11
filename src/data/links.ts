export type FriendLink = {
	name: string;
	url: string;
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
		url: 'https://creatinf.com/',
		description: 'AI-assisted creative engineering tools and practical workflows.',
		tags: ['Project', 'AI', 'Tools'],
		status: 'active',
	},
	{
		name: 'Licyk',
		github: 'licyk',
		url: 'https://licyk.netlify.app/',
		description: 'Builds AI art tooling and automation around Stable Diffusion and image workflows.',
		tags: ['AI', 'Tools', 'Scripts'],
		status: 'active',
	},
	{
		name: 'Herbert Skyper',
		github: 'herbertskyper',
		url: 'https://www.skyper.site/',
		description:
			'Interested in AI and operating systems; currently exploring databases, server systems, and high-performance computing.',
		tags: ['AI', 'OS', 'HPC'],
		status: 'active',
	},
	{
		name: 'nix',
		github: 'Nixdorfer',
		url: 'https://github.com/Nixdorfer',
		description: 'Projects and experiments across repositories; personal dev space on GitHub.',
		tags: ['Dev', 'Projects', 'GitHub'],
		status: 'active',
	},
	{
		name: 'kirintea',
		url: 'https://github.com/kirintea',
		github: 'kirintea',
		description: 'Open-source developer.',
		tags: ['GitHub', 'Open Source'],
		status: 'active',
	},
	{
		name: '似镜流年',
		url: 'https://space.bilibili.com/518374328',
		type: 'bilibili',
		avatar: '/image/bili/sijingliunian.jpg',
		description: 'Arknights strategy creator focusing on low-cost and easy-to-follow clear guides.',
		tags: ['Bilibili', 'Arknights', 'Strategy'],
		status: 'active',
	},
	{
		name: '防御老猫',
		url: 'https://space.bilibili.com/3546757950605988',
		type: 'bilibili',
		avatar: '/image/bili/fangyulaomao.jpg',
		description: 'Anime-themed edits and emotional short-form videos.',
		tags: ['Bilibili', 'Anime', 'Edits'],
		status: 'active',
	},
	{
		name: '白色孤离',
		url: 'https://space.bilibili.com/178692716',
		type: 'bilibili',
		avatar: '/image/bili/baiseguli.jpg',
		description: 'MAD and anime edit creator with high-production fan works.',
		tags: ['Bilibili', 'MAD', 'Anime'],
		status: 'active',
	},
	{
		name: '茉莉间雨奏',
		url: 'https://space.bilibili.com/503991648?spm_id_from=333.337.0.0',
		type: 'bilibili',
		avatar: '/image/bili/molijianyuzou.jpg',
		description: 'Bilibili creator.',
		tags: ['Bilibili'],
		status: 'active',
	},
	{
		name: 'uiuiuiui8',
		url: '',
		type: 'bilibili',
		avatar: '/image/bili/uiuiuiui8.jpg',
		description: 'AI model training and 3D printing research.',
		tags: ['AI', 'Machine Learning', '3D Printing'],
		status: 'active',
	},
];
