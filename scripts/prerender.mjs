import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { render, storyRoutes } from '../.prerender/entry-server.js';

const origin = 'https://photosnap-studio.ramtinbabaei-portfolio.workers.dev';
const template = await readFile('dist/index.html', 'utf8');
const routes = [
  {
    path: '/',
    title: 'Create and share your photo stories',
    description:
      'Photosnap is a platform for photographers and visual storytellers. Share photos, tell stories and connect with others.',
  },
  {
    path: '/stories',
    title: 'Stories',
    description:
      'Explore visual stories from mountains and cityscapes to wildlife and the night sky.',
  },
  {
    path: '/features',
    title: 'Features',
    description: 'Tools designed for every aspiring and professional visual storyteller.',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'Compare Basic, Pro and Business plans with monthly or yearly billing.',
  },
  {
    path: '/invite',
    title: 'Get an invite',
    description: 'Make room for your next story. Request an invitation to Photosnap.',
  },
  {
    path: '/privacy',
    title: 'Privacy & demo information',
    description: 'How Photosnap handles invitation requests and your personal data.',
  },
  {
    path: '/404',
    title: 'Page not found',
    description: 'Explore another perspective on Photosnap.',
  },
];
routes.push(...storyRoutes);
const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
for (const route of routes) {
  const markup = await render(route.path);
  const meta = `<link rel="canonical" href="${origin}${route.path === '/' ? '' : route.path}" /><meta property="og:title" content="${escape(route.title)} | Photosnap" /><meta property="og:description" content="${escape(route.description)}" /><meta property="og:type" content="website" /><meta property="og:url" content="${origin}${route.path}" /><meta property="og:image" content="${origin}/assets/create-and-share.webp" /><meta name="twitter:card" content="summary_large_image" />${route.path === '/404' ? '<meta name="robots" content="noindex" />' : ''}`;
  const html = template
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${escape(route.title)} | Photosnap</title>`)
    .replace(
      /<meta name="description"[^>]*\/>/,
      `<meta name="description" content="${escape(route.description)}" />`,
    )
    .replace('</head>', `${meta}</head>`);
  const file = route.path === '/' ? 'dist/index.html' : `dist${route.path}.html`;
  await mkdir(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  await writeFile(file, html);
}
await writeFile(
  'dist/robots.txt',
  `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes
    .filter((route) => !['/404', '/invite'].includes(route.path))
    .map((route) => `<url><loc>${origin}${route.path}</loc></url>`)
    .join('')}</urlset>`,
);
await rm('.prerender', { recursive: true, force: true });
console.log(`Prerendered ${routes.length} routes, sitemap.xml and robots.txt.`);
