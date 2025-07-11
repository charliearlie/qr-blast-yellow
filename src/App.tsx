import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import QRDetailPage from "./pages/QRDetailPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import EditQRPage from "./pages/EditQRPage";
import LoginPage from "./pages/LoginPage";
import Redirect from "./pages/Redirect";
import NotFoundPage from "./pages/NotFoundPage";
import BlogIndexPage from "./pages/BlogIndexPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import GDPRPage from "./pages/GDPRPage";

import React from 'react';
import { useParams } from 'react-router-dom';

// Dynamic import for blog posts
const blogPosts = import.meta.glob('/src/content/blog/*.mdx');

const queryClient = new QueryClient();

// Blog post route component
const BlogPostRoute = () => {
  const { slug } = useParams<{ slug: string }>();
  const [BlogPost, setBlogPost] = React.useState<React.ComponentType | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (slug) {
      const postPath = `/src/content/blog/${slug}.mdx`;
      if (blogPosts[postPath]) {
        blogPosts[postPath]().then((module: { default: React.ComponentType }) => {
          setBlogPost(() => module.default);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!BlogPost) {
    return <NotFoundPage />;
  }

  return <BlogPost />;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Routes with Layout */}
              <Route path="/" element={<Layout><LandingPage /></Layout>} />
              <Route path="/generate" element={<Layout><HomePage /></Layout>} />
              <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
              <Route path="/qr/:id" element={<Layout><QRDetailPage /></Layout>} />
              <Route path="/analytics/:id" element={<Layout><AnalyticsPage /></Layout>} />
              <Route path="/edit/:id" element={<Layout><EditQRPage /></Layout>} />
              
              {/* Blog Routes (no layout - they have their own) */}
              <Route path="/blog" element={<BlogIndexPage />} />
              <Route path="/blog/:slug" element={<BlogPostRoute />} />
              
              {/* Legal Routes (with layout) */}
              <Route path="/privacy" element={<Layout><PrivacyPolicyPage /></Layout>} />
              <Route path="/terms" element={<Layout><TermsOfServicePage /></Layout>} />
              <Route path="/cookies" element={<Layout><CookiePolicyPage /></Layout>} />
              <Route path="/gdpr" element={<Layout><GDPRPage /></Layout>} />
              
              {/* Standalone Routes (no layout) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/r/:shortCode" element={<Redirect />} />
              
              {/* Catch-all 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
