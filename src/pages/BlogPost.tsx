import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

// SECURITY: Sanitize all HTML content before rendering
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  author_name: string;
  category: string | null;
  read_time: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (fetchError || !data) {
          setError(true);
        } else {
          setPost(data);
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-20 pb-12 px-4 md:px-8">
          <div className="container mx-auto max-w-4xl">
            <Skeleton className="h-8 w-32 mb-8 bg-white/10" />
            <Skeleton className="aspect-[16/9] w-full rounded-lg mb-8 bg-white/10" />
            <Skeleton className="h-12 w-3/4 mb-4 bg-white/10" />
            <Skeleton className="h-6 w-1/2 mb-8 bg-white/10" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-3/4 bg-white/10" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error or not found state
  if (error || !post) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-20 pb-12 px-8">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-serif luxury-glow mb-4">Post Not Found</h1>
            <p className="text-white/60 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <div className="pt-20 pb-12 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link to="/blog" className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          {/* Hero Image */}
          {post.image_url && (
            <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
              <img
                src={post.image_url}
                alt={post.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {post.category && (
                <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-full">{post.category}</span>
              )}
              {post.read_time && (
                <span className="text-sm text-white/60">{post.read_time}</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif luxury-glow mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-white/60 text-sm">
              <span>{formatDate(post.published_at || post.created_at)}</span>
              <span className="mx-2">•</span>
              <span>By {post.author_name}</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            {/* SECURITY: Sanitize HTML to prevent XSS attacks */}
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-serif luxury-glow mb-4">
              Ready to Experience Zavira?
            </h3>
            <p className="text-white/80 mb-6">
              Book your appointment today and discover the difference professional care makes.
            </p>
            <Button asChild size="lg">
              <Link to="/booking">Book Now</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
