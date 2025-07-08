import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

interface BlogPostLayoutProps {
  frontmatter: {
    title: string;
    description: string;
    date: string;
    author: string;
  };
  children: React.ReactNode;
}

const BlogPostLayout = ({ frontmatter, children }: BlogPostLayoutProps) => {
  const slug = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';
  
  // Structured data for blog post
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": frontmatter.title,
    "description": frontmatter.description,
    "author": {
      "@type": "Organization",
      "name": frontmatter.author,
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
    "datePublished": frontmatter.date,
    "dateModified": frontmatter.date,
    "url": `https://blastqr.com/blog/${slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://blastqr.com/blog/${slug}`
    },
    "keywords": "dynamic QR codes, QR code generator, QR analytics, marketing technology",
    "articleSection": "Technology",
    "wordCount": typeof children === 'string' ? children.split(' ').length : 1000,
    "image": {
      "@type": "ImageObject",
      "url": "https://blastqr.com/img/qr-full.png",
      "width": 1024,
      "height": 1024
    }
  };

  return (
    <>
      <SEO 
        title={`${frontmatter.title} - Blast QR`} 
        description={frontmatter.description}
        ogType="article"
        canonical={`/blog/${slug}`}
        ogImage="https://blastqr.com/img/qr-full.png"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header Navigation */}
        <div className="bg-black text-white py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-primary transition-colors font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <div className="max-w-4xl mx-auto py-12 px-4">
          <Card className="brutal-card p-8 mb-8">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(frontmatter.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{frontmatter.author}</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
              {frontmatter.title}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              {frontmatter.description}
            </p>
          </Card>

          {/* Article Content */}
          <Card className="brutal-card p-8 mb-8">
            <article className="prose prose-lg max-w-none 
              prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-bold
              prose-ul:text-muted-foreground prose-li:text-muted-foreground
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6
              prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-hr:border-border prose-hr:my-8">
              {children}
            </article>
          </Card>

          {/* CTA Section */}
          <Card className="brutal-card p-8 bg-primary/10 border-primary/20 text-center">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
              Ready to Create Your Own Dynamic QR Code?
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Put what you've learned into action. Generate your first intelligent QR code in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="font-bold uppercase tracking-tight">
                <Link to="/generate">
                  Start Creating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="font-bold uppercase tracking-tight">
                <Link to="/blog">
                  Read More Articles
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPostLayout;