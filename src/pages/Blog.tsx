import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { FadeInUp, MagneticButton } from '@/components/animations';
import { useLanguage } from '@/hooks/use-language';

// Animation variants for blog
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

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
  const { t } = useLanguage();

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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <FadeInUp>
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow mb-4"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(255,255,255,0.5)',
                    '0 0 40px rgba(255,255,255,0.8)',
                    '0 0 20px rgba(255,255,255,0.5)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {t('blogTitle')}
              </motion.h1>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <p className="text-muted-foreground text-lg tracking-wider">
                {t('blogSubtitle')}
              </p>
            </FadeInUp>
          </div>

          {/* Category Filter */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`text-sm ${selectedCategory === category ? 'bg-foreground text-background' : 'border-border text-foreground hover:bg-accent'}`}
                >
                  {category}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-border rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full bg-accent" />
                  <div className="p-6">
                    <Skeleton className="h-4 w-24 mb-3 bg-accent" />
                    <Skeleton className="h-6 w-full mb-2 bg-accent" />
                    <Skeleton className="h-4 w-full mb-4 bg-accent" />
                    <Skeleton className="h-4 w-32 bg-accent" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-muted-foreground text-lg">{t('noBlogPosts')}</p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={selectedCategory}
            >
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    layout
                    variants={cardVariants}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block border border-border rounded-2xl overflow-hidden hover:border-foreground/30 transition-all duration-500 cursor-hover bg-accent/50"
                    >
                      <motion.div
                        whileHover={{
                          scale: 1.02,
                          boxShadow: '0 20px 40px rgba(255, 255, 255, 0.1)',
                          transition: { type: 'spring', stiffness: 300 }
                        }}
                      >
                        {/* Image with reveal effect */}
                        {post.image_url && (
                          <div className="aspect-[16/10] overflow-hidden relative">
                            <motion.img
                              src={post.image_url}
                              alt={post.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.6 }}
                            />
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                          {/* Category & Read Time */}
                          <div className="flex items-center gap-3 mb-3">
                            {post.category && (
                              <motion.span
                                className="text-xs bg-accent text-foreground px-2 py-1 rounded-full"
                                whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                              >
                                {post.category}
                              </motion.span>
                            )}
                            {post.read_time && (
                              <span className="text-xs text-muted-foreground">{post.read_time}</span>
                            )}
                          </div>

                          {/* Title */}
                          <motion.h3
                            className="text-xl font-serif text-foreground mb-2 transition-all"
                            whileHover={{
                              textShadow: '0 0 20px rgba(255,255,255,0.5)'
                            }}
                          >
                            {post.title}
                          </motion.h3>

                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}

                          {/* Author & Date */}
                          <div className="flex items-center text-muted-foreground text-xs">
                            <span>{formatDate(post.published_at || post.created_at)}</span>
                            <span className="mx-2">•</span>
                            <span>{t('byAuthor')} {post.author_name}</span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
