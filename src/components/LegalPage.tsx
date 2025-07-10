import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LegalPageProps {
  contentPath: string;
  title: string;
}

const LegalPage = ({ contentPath, title }: LegalPageProps) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load the markdown file from public directory
        const response = await fetch(contentPath);
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }
        
        const markdown = await response.text();
        setContent(markdown);
      } catch (err) {
        console.error('Error loading legal content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [contentPath]);

  // Simple markdown to HTML converter for basic formatting
  const renderMarkdown = (markdown: string) => {
    return markdown
      // Headers
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-black mb-6 text-primary">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mb-4 mt-8 text-foreground">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mb-3 mt-6 text-foreground">$1</h3>')
      .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold mb-2 mt-4 text-foreground">$1</h4>')
      
      // Bold text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      
      // Italic text
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      
      // Code blocks
      .replace(/```(.+?)```/gs, '<pre class="bg-muted p-4 rounded-md border-2 border-border my-4 overflow-x-auto"><code class="text-sm">$1</code></pre>')
      
      // Inline code
      .replace(/`(.+?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm border">$1</code>')
      
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists
      .replace(/^- (.+)$/gm, '<li class="mb-2">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc pl-6 mb-4 space-y-1">$1</ul>')
      
      // Paragraphs
      .replace(/^([^<#\-\n].+)$/gm, '<p class="mb-4 text-muted-foreground leading-relaxed">$1</p>')
      
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="brutal-card p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="brutal-card p-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Error Loading {title}</h1>
            <p className="text-muted-foreground">
              We're sorry, but we couldn't load the {title.toLowerCase()} content at this time.
            </p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="brutal-card p-8">
        <div className="prose prose-slate max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(content)
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default LegalPage;