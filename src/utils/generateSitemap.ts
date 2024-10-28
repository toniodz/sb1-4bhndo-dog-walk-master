// src/utils/generateSitemap.ts
import { fetchWalks } from '../api/strapi';

export const generateSitemap = async () => {
  const walks = await fetchWalks();
  const baseUrl = 'https://dogwalksnearme.uk';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/dog-walks</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      ${walks.map(walk => `
        <url>
          <loc>${baseUrl}/dog-walks/${walk.slug}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`;

  return xml;
};
