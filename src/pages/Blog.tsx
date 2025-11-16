import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: 'Summer Hair Care Tips',
    excerpt: 'Keep your hair healthy and vibrant during the hot summer months with these expert tips.',
    image: '/images/blog-1.jpg',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'The Art of Skincare',
    excerpt: 'Discover the secrets to radiant, glowing skin with our comprehensive skincare guide.',
    image: '/images/blog-2.jpg',
    date: '2024-01-10'
  },
  {
    id: 3,
    title: 'Nail Trends 2024',
    excerpt: 'Stay ahead of the curve with the latest nail art and color trends for the new year.',
    image: '/images/blog-3.jpg',
    date: '2024-01-05'
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-black">
      <CustomCursor />
      <Navigation />
      
      <div className="pt-32 pb-24 px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-serif luxury-glow mb-4">
              BLOG
            </h1>
            <p className="text-muted-foreground text-lg tracking-wider">
              Beauty insights and expert advice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group frosted-glass border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-500 cursor-hover"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 image-hover-glow"
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm text-white/60 tracking-wider mb-2">{post.date}</p>
                  <h3 className="text-2xl font-serif luxury-glow mb-3">{post.title}</h3>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                  <span className="inline-block mt-4 text-white hover:luxury-glow transition-all">
                    Read More →
                  </span>
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
