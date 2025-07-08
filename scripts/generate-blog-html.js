import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base HTML template
const getHTMLTemplate = (frontmatter, slug) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${frontmatter.title} - Blast QR</title>
    <meta name="description" content="${frontmatter.description}" />
    <meta name="keywords" content="QR code generator, dynamic QR codes, QR analytics, ${frontmatter.title}" />
    <meta name="author" content="${frontmatter.author}" />
    <link rel="canonical" href="https://blastqr.com/blog/${slug}" />

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${frontmatter.title} - Blast QR" />
    <meta property="og:description" content="${frontmatter.description}" />
    <meta property="og:type" content="article" />
    <meta property="og:image" content="https://blastqr.com/img/qr-full.png" />
    <meta property="og:image:width" content="1024" />
    <meta property="og:image:height" content="1024" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:url" content="https://blastqr.com/blog/${slug}" />
    <meta property="og:site_name" content="Blast QR" />
    <meta property="article:author" content="${frontmatter.author}" />
    <meta property="article:published_time" content="${frontmatter.date}" />
    <meta property="article:section" content="Technology" />
    <meta property="article:tag" content="QR codes" />
    <meta property="article:tag" content="Dynamic QR codes" />
    <meta property="article:tag" content="Marketing" />

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${frontmatter.title} - Blast QR" />
    <meta name="twitter:description" content="${frontmatter.description}" />
    <meta name="twitter:image" content="https://blastqr.com/img/qr-full.png" />

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/favicon.png" />

    <!-- Additional SEO -->
    <meta name="robots" content="index,follow" />
    <meta name="theme-color" content="#F59E0B" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${frontmatter.title}",
      "description": "${frontmatter.description}",
      "author": {
        "@type": "Organization",
        "name": "${frontmatter.author}",
        "url": "https://blastqr.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Blast QR",
        "url": "https://blastqr.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://blastqr.com/img/qr-full.png",
          "width": 1024,
          "height": 1024
        }
      },
      "datePublished": "${frontmatter.date}",
      "dateModified": "${frontmatter.date}",
      "url": "https://blastqr.com/blog/${slug}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://blastqr.com/blog/${slug}"
      },
      "keywords": "dynamic QR codes, QR code generator, QR analytics, marketing technology",
      "articleSection": "Technology",
      "image": {
        "@type": "ImageObject",
        "url": "https://blastqr.com/img/qr-full.png",
        "width": 1024,
        "height": 1024
      }
    }
    </script>
  </head>

  <body>
    <noscript>
      <h1>${frontmatter.title} - Blast QR</h1>
      <p>${frontmatter.description}</p>
      <p>You need to enable JavaScript to read this blog post. This is a blog post about QR codes and dynamic QR technology.</p>
    </noscript>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

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
      const frontmatterMatch = content.match(/export const frontmatter = \{([^}]+)\}/);
      if (frontmatterMatch) {
        const frontmatterContent = frontmatterMatch[1];
        
        // Parse the frontmatter object
        const titleMatch = frontmatterContent.match(/title: ["']([^"']+)["']/);
        const descriptionMatch = frontmatterContent.match(/description: ["']([^"']+)["']/);
        const dateMatch = frontmatterContent.match(/date: ["']([^"']+)["']/);
        const authorMatch = frontmatterContent.match(/author: ["']([^"']+)["']/);
        
        if (titleMatch && descriptionMatch && dateMatch && authorMatch) {
          const slug = file.replace('.mdx', '');
          const frontmatter = {
            title: titleMatch[1],
            description: descriptionMatch[1],
            date: dateMatch[1],
            author: authorMatch[1]
          };
          
          posts.push({ slug, frontmatter });
        }
      }
    }
  }
  
  return posts;
}

// Function to generate HTML files for blog posts
function generateBlogHTML() {
  const posts = getBlogPosts();
  const distDir = path.join(__dirname, '..', 'dist');
  const blogDir = path.join(distDir, 'blog');
  
  // Create blog directory if it doesn't exist
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }
  
  for (const post of posts) {
    const postDir = path.join(blogDir, post.slug);
    
    // Create post directory
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    
    // Generate HTML
    const html = getHTMLTemplate(post.frontmatter, post.slug);
    
    // Write index.html for the post
    fs.writeFileSync(path.join(postDir, 'index.html'), html);
    
    console.log(`✅ Generated HTML for: /blog/${post.slug}/`);
  }
  
  console.log(`📝 Generated HTML files for ${posts.length} blog posts`);
}

// Run the script
if (process.argv[1] === __filename) {
  generateBlogHTML();
}

export { generateBlogHTML };