import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  author_name: string;
  category: string | null;
  read_time: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const Blog = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  // Set category from URL parameter
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false, nullsFirst: false });

        if (error) {
          console.error('Error fetching blog posts:', error);
        } else if (data) {
          setPosts(data);
          // Extract unique categories
          const uniqueCategories = ['All', ...new Set(data.map(post => post.category).filter(Boolean) as string[])];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="pt-20 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow mb-4">
              BLOG
            </h1>
            <p className="text-white/70 text-lg tracking-wider">
              Beauty insights and expert advice
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`text-sm ${selectedCategory === category ? 'bg-white text-black' : 'border-white/20 text-white hover:bg-white/10'}`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-white/10 rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full bg-white/10" />
                  <div className="p-6">
                    <Skeleton className="h-4 w-24 mb-3 bg-white/10" />
                    <Skeleton className="h-6 w-full mb-2 bg-white/10" />
                    <Skeleton className="h-4 w-full mb-4 bg-white/10" />
                    <Skeleton className="h-4 w-32 bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No blog posts found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-500 cursor-hover bg-black/50"
                >
                  {/* Image */}
                  {post.image_url && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Category & Read Time */}
                    <div className="flex items-center gap-3 mb-3">
                      {post.category && (
                        <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-full">
                          {post.category}
                        </span>
                      )}
                      {post.read_time && (
                        <span className="text-xs text-white/50">{post.read_time}</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-serif text-white mb-2 group-hover:luxury-glow transition-all">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Author & Date */}
                    <div className="flex items-center text-white/50 text-xs">
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                      <span className="mx-2">•</span>
                      <span>By {post.author_name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
