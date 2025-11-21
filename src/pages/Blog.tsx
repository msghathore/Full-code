import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

const blogPosts = [
  {
    id: 1,
    title: 'Summer Hair Care Tips',
    excerpt: 'Keep your hair healthy and vibrant during the hot summer months with these expert tips.',
    image: '/images/blog-1.jpg',
    date: '2024-07-15',
    author: 'Zavira Team',
    category: 'Hair Care',
    readTime: '5 min read'
  },
  {
    id: 2,
    title: 'The Art of Skincare',
    excerpt: 'Discover the secrets to radiant, glowing skin with our comprehensive skincare guide.',
    image: '/images/blog-2.jpg',
    date: '2024-06-10',
    author: 'Dr. Elena Vasquez',
    category: 'Skin Care',
    readTime: '8 min read'
  },
  {
    id: 3,
    title: 'Nail Trends 2024',
    excerpt: 'Stay ahead of the curve with the latest nail art and color trends for the new year.',
    image: '/images/blog-3.jpg',
    date: '2024-01-05',
    author: 'Maria Rodriguez',
    category: 'Nails',
    readTime: '6 min read'
  },
  {
    id: 4,
    title: 'Massage Therapy Benefits',
    excerpt: 'Why regular massages are essential for your well-being and relaxation.',
    image: '/images/product-1.jpg',
    date: '2024-05-20',
    author: 'James Chen',
    category: 'Wellness',
    readTime: '7 min read'
  },
  {
    id: 5,
    title: 'Sustainable Beauty Practices',
    excerpt: 'How to maintain your beauty routine while being environmentally conscious.',
    image: '/images/product-2.jpg',
    date: '2024-08-12',
    author: 'Zavira Team',
    category: 'Sustainability',
    readTime: '4 min read'
  },
  {
    id: 6,
    title: 'Anti-Aging Treatments Guide',
    excerpt: 'Explore the latest anti-aging treatments and their effectiveness.',
    image: '/images/product-3.jpg',
    date: '2024-09-01',
    author: 'Dr. Elena Vasquez',
    category: 'Skin Care',
    readTime: '10 min read'
  },
  {
    id: 7,
    title: 'Piercing Aftercare Tips',
    excerpt: 'Essential aftercare tips for new piercings to ensure proper healing.',
    image: '/images/product-4.jpg',
    date: '2024-07-28',
    author: 'Zavira Team',
    category: 'Piercings',
    readTime: '5 min read'
  },
  {
    id: 8,
    title: 'Tattoo Care and Maintenance',
    excerpt: 'How to properly care for your new tattoo for optimal healing and longevity.',
    image: '/images/product-5.jpg',
    date: '2024-06-15',
    author: 'James Chen',
    category: 'Tattoos',
    readTime: '6 min read'
  },
];

const categories = ['All', 'Hair Care', 'Skin Care', 'Nails', 'Wellness', 'Sustainability', 'Piercings', 'Tattoos'];

const Blog = () => {
  console.log('Blog component rendering');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  console.log('Returning JSX');
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div style={{ paddingTop: '128px', paddingBottom: '96px', paddingLeft: '32px', paddingRight: '32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h1 className="text-6xl md:text-7xl font-sans mb-4" style={{ color: 'white' }}>
              BLOG
            </h1>
            <p style={{ color: '#ccc', fontSize: '18px' }}>
              Beauty insights and expert advice
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '48px' }}>
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                style={{ fontSize: '14px' }}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-500 cursor-hover" style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', padding: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontFamily: 'serif', color: 'white', marginBottom: '12px' }}>{post.title}</h3>
                  <p style={{ color: '#ccc' }}>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
