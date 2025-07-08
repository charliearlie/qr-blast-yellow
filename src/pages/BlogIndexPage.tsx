import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

// Vite's glob import feature - gets all blog posts
const posts = import.meta.glob('/src/content/blog/*.mdx', { eager: true });

const BlogIndexPage = () => {
  const blogPosts = Object.entries(posts).map(([path, post]: [string, { frontmatter: { title: string; description: string; date: string; author: string } }]) => {
    const slug = path.split('/').pop()?.replace('.mdx', '');
    return {
      slug,
      ...post.frontmatter,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Structured data for blog index
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "The Blast QR Blog",
    "description": "Tutorials, tips, and articles on creating effective QR codes, dynamic QR technology, and marketing best practices.",
    "url": "https://blastqr.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Blast QR",
      "url": "https://blastqr.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://blastqr.com/img/qr-full.png"
      }
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "url": `https://blastqr.com/blog/${post.slug}`,
      "datePublished": post.date,
      "author": {
        "@type": "Organization",
        "name": post.author
      }
    }))
  };

  return (
    <>
      <SEO 
        title="Blog - Blast QR" 
        description="Tutorials, tips, and articles on creating effective QR codes, dynamic QR technology, and marketing best practices."
        keywords="QR code blog, dynamic QR codes, QR code marketing, QR code tutorials, QR analytics"
        canonical="/blog"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-black text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">
              The <span className="text-primary">Blast QR</span> Blog
            </h1>
            <p className="text-xl md:text-2xl font-bold text-gray-300 max-w-3xl mx-auto">
              Tutorials, tips, and insights on creating intelligent QR codes that work smarter, not harder.
            </p>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-4xl mx-auto py-16 px-4">
          <div className="grid gap-8">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="brutal-card overflow-hidden hover:shadow-brutal-sm transition-shadow">
                <div className="p-8">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {post.description}
                  </p>
                  
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="brutal-card p-8 bg-primary/10 border-primary/20">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
                Ready to Create Your Own Dynamic QR Code?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Put what you've learned into action. Generate your first intelligent QR code in seconds.
              </p>
              <Link 
                to="/generate"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-tight hover:bg-primary/90 transition-colors"
              >
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogIndexPage;