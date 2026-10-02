/*
 * One-shot brand asset generator.
 * Builds the full favicon set (circle-cropped from the original avatar) and a
 * PNG-embedded multi-size favicon.ico, replacing the Astro template defaults.
 *
 *   node scripts/generate-brand-assets.mjs
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const SOURCE = path.join(publicDir, 'image', 'DanArnoux.jpg');

const circlePng = async (size) => {
	const mask = Buffer.from(
		`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
	);
	return sharp(SOURCE)
		.resize(size, size, { fit: 'cover' })
		.composite([{ input: mask, blend: 'dest-in' }])
		.png()
		.toBuffer();
};

// ICO container with PNG-compressed entries (supported since Windows Vista / all browsers).
const buildIco = (entries) => {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(entries.length, 4);

	const dirs = [];
	const blobs = [];
	let offset = 6 + 16 * entries.length;
	for (const { size, buf } of entries) {
		const dir = Buffer.alloc(16);
		dir.writeUInt8(size >= 256 ? 0 : size, 0);
		dir.writeUInt8(size >= 256 ? 0 : size, 1);
		dir.writeUInt8(0, 2);
		dir.writeUInt8(0, 3);
		dir.writeUInt16LE(1, 4);
		dir.writeUInt16LE(32, 6);
		dir.writeUInt32LE(buf.length, 8);
		dir.writeUInt32LE(offset, 12);
		dirs.push(dir);
		blobs.push(buf);
		offset += buf.length;
	}
	return Buffer.concat([header, ...dirs, ...blobs]);
};

const main = async () => {
	const [png16, png32, png48, png64, png180, png192, png512] = await Promise.all(
		[16, 32, 48, 64, 180, 192, 512].map(circlePng)
	);

	const ico = buildIco([
		{ size: 16, buf: png16 },
		{ size: 32, buf: png32 },
		{ size: 48, buf: png48 },
	]);

	// SVG favicon wraps the 64px raster so the root svg route also shows the avatar.
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image href="data:image/png;base64,${png64.toString('base64')}" width="64" height="64"/></svg>`;

	await Promise.all([
		writeFile(path.join(publicDir, 'favicon.ico'), ico),
		writeFile(path.join(publicDir, 'image', 'favicon.ico'), ico),
		writeFile(path.join(publicDir, 'favicon.svg'), svg),
		writeFile(path.join(publicDir, 'image', 'favicon-32.png'), png32),
		writeFile(path.join(publicDir, 'image', 'favicon-192.png'), png192),
		writeFile(path.join(publicDir, 'image', 'favicon-512.png'), png512),
		writeFile(path.join(publicDir, 'image', 'apple-touch-icon.png'), png180),
	]);

	console.log('Brand favicon set generated from', path.relative(root, SOURCE));
};

await main();
