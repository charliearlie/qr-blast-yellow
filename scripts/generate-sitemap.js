import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL for the site
const BASE_URL = 'https://blastqr.com';

// Static routes with their priorities and change frequencies
const staticRoutes = [
  { url: '/', lastmod: '2025-07-09', changefreq: 'daily', priority: '1.0' },
  { url: '/generate', lastmod: '2025-07-09', changefreq: 'weekly', priority: '0.9' },
  { url: '/blog', lastmod: '2025-07-09', changefreq: 'weekly', priority: '0.8' },
  { url: '/login', lastmod: '2025-01-07', changefreq: 'monthly', priority: '0.6' },
  { url: '/about', lastmod: '2025-01-07', changefreq: 'monthly', priority: '0.7' },
  { url: '/privacy', lastmod: '2025-01-07', changefreq: 'yearly', priority: '0.5' },
  { url: '/terms', lastmod: '2025-01-07', changefreq: 'yearly', priority: '0.5' },
];

// Function to get all blog posts
function getBlogPosts() {
  const blogDir = path.join(__dirname, '..', 'src', 'content', 'blog');
  
  if (!fs.existsSync(blogDir)) {
    return [];
  }
  
  const files = fs.readdirSync(blogDir);
  const posts = [];
  
  for (const file of files) {
    if (file.endsWith('.mdx')) {
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract frontmatter
      const frontmatterMatch = content.match(/export const frontmatter = {([^}]+)}/);
      if (frontmatterMatch) {
        const frontmatterContent = frontmatterMatch[1];
        const dateMatch = frontmatterContent.match(/date: ["']([^"']+)["']/);
        
        const slug = file.replace('.mdx', '');
        const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
        
        posts.push({
          url: `/blog/${slug}`,
          lastmod: date,
          changefreq: 'monthly',
          priority: '0.7'
        });
      }
    }
  }
  
  return posts;
}

// Function to generate sitemap XML
function generateSitemap() {
  const blogPosts = getBlogPosts();
  const allRoutes = [...staticRoutes, ...blogPosts];
  
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xmlContent;
}

// Write sitemap to public directory
function writeSitemap() {
  const sitemap = generateSitemap();
  const publicDir = path.join(__dirname, '..', 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
  console.log(`📝 Included ${getBlogPosts().length} blog posts`);
}

// Run the script
if (process.argv[1] === __filename) {
  writeSitemap();
}

export { generateSitemap, writeSitemap, getBlogPosts };