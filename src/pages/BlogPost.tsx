import { useParams, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'Summer Hair Care Tips',
    excerpt: 'Keep your hair healthy and vibrant during the hot summer months with these expert tips.',
    image: '/images/blog-1.jpg',
    date: '2024-07-15',
    author: 'Zavira Team',
    category: 'Hair Care',
    readTime: '5 min read',
    content: `
      <h2>The Ultimate Summer Hair Care Guide</h2>
      <p>Summer brings sunshine, beach days, and unfortunately, hair damage. But with the right care routine, you can keep your locks looking fabulous all season long. Here are our expert tips from Zavira's master stylists.</p>

      <h3>1. Protect Before You Step Out</h3>
      <p>UV rays are your hair's worst enemy in summer. Always apply a UV-protecting spray or serum before heading outdoors. Look for products with SPF 30+ specifically formulated for hair.</p>

      <h3>2. Embrace the Power of Oils</h3>
      <p>Natural oils like argan, coconut, and jojoba can work wonders for summer hair. Apply a few drops to the ends daily to combat dryness and frizz.</p>

      <h3>3. Chlorine and Salt Water Solutions</h3>
      <p>Swimming is summer fun, but it wreaks havoc on hair. Rinse with fresh water immediately after swimming, and consider using a clarifying shampoo weekly to remove mineral buildup.</p>

      <h3>4. Trim Regularly</h3>
      <p>Summer heat can make split ends worse. Schedule a trim every 6-8 weeks to keep your hair healthy and prevent further damage.</p>

      <h3>5. Deep Conditioning is Key</h3>
      <p>Treat your hair to a deep conditioning mask once a week. Leave it on for 20-30 minutes under a shower cap for maximum benefits.</p>

      <p>At Zavira, we specialize in summer hair restoration treatments that can repair and revitalize sun-damaged hair. Book your appointment today!</p>
    `
  },
  {
    id: 2,
    title: 'The Art of Skincare',
    excerpt: 'Discover the secrets to radiant, glowing skin with our comprehensive skincare guide.',
    image: '/images/blog-2.jpg',
    date: '2024-06-10',
    author: 'Dr. Elena Vasquez',
    category: 'Skin Care',
    readTime: '8 min read',
    content: `
      <h2>Mastering the Art of Skincare: A Complete Guide</h2>
      <p>Beautiful skin isn't just about genetics—it's about understanding your skin type and giving it what it needs. As a dermatologist and skincare specialist at Zavira, I've helped countless clients achieve their glow-up goals.</p>

      <h3>Know Your Skin Type</h3>
      <p>The first step to great skincare is identifying your skin type: oily, dry, combination, sensitive, or normal. Each type requires different care approaches.</p>

      <h3>The Essential Routine</h3>
      <p>Keep it simple: cleanse, tone, treat, moisturize, and protect. Consistency is more important than complexity.</p>

      <h3>Key Ingredients to Look For</h3>
      <ul>
        <li><strong>Hyaluronic Acid:</strong> The ultimate hydrator</li>
        <li><strong>Retinol:</strong> For anti-aging and cell turnover</li>
        <li><strong>Vitamin C:</strong> Brightening and antioxidant protection</li>
        <li><strong>Niacinamide:</strong> Oil control and pore minimization</li>
      </ul>

      <h3>Common Mistakes to Avoid</h3>
      <p>Over-exfoliating, skipping sunscreen, and using products that don't match your skin type are the biggest skincare sins.</p>

      <h3>Professional Treatments</h3>
      <p>While at-home care is essential, professional treatments can take your skin to the next level. Consider facials, chemical peels, or microdermabrasion at Zavira for professional-grade results.</p>

      <p>Remember, skincare is a journey, not a destination. Be patient and consistent, and you'll see amazing results!</p>
    `
  },
  {
    id: 3,
    title: 'Nail Trends 2024',
    excerpt: 'Stay ahead of the curve with the latest nail art and color trends for the new year.',
    image: '/images/blog-3.jpg',
    date: '2024-01-05',
    author: 'Maria Rodriguez',
    category: 'Nails',
    readTime: '6 min read',
    content: `
      <h2>2024 Nail Trends: What's Hot and What's Not</h2>
      <p>As we step into 2024, the nail world is buzzing with exciting new trends. From sustainable practices to bold colors, here's what's shaping the future of nail art.</p>

      <h3>Sustainable Beauty Takes Center Stage</h3>
      <p>Eco-friendly nail products are no longer a niche—they're mainstream. Look for water-permeable formulas, natural ingredients, and recyclable packaging.</p>

      <h3>Color Psychology in Nail Art</h3>
      <p>Colors aren't just pretty; they express personality. Deep emerald greens for confidence, soft pastels for approachability, and metallics for glamour.</p>

      <h3>Minimalist Maximalism</h3>
      <p>The trend is clean, simple designs with one statement element—a single rhinestone, a thin stripe, or a subtle ombre effect.</p>

      <h3>Wellness-Inspired Designs</h3>
      <p>Nail art inspired by wellness practices: chakra colors, crystal-inspired designs, and nature motifs that promote mindfulness.</p>

      <h3>Tech-Enhanced Nails</h3>
      <p>UV-reactive polishes, color-changing gels, and glow-in-the-dark options are making waves in the industry.</p>

      <h3>Gender Fluid Beauty</h3>
      <p>Breaking traditional boundaries with designs that work for everyone, regardless of gender expression.</p>

      <p>At Zavira, our nail technicians stay ahead of trends while providing personalized service. Whether you want the latest trend or a classic look, we've got you covered!</p>
    `
  },
  {
    id: 4,
    title: 'Massage Therapy Benefits',
    excerpt: 'Why regular massages are essential for your well-being and relaxation.',
    image: '/images/product-1.jpg',
    date: '2024-05-20',
    author: 'James Chen',
    category: 'Wellness',
    readTime: '7 min read',
    content: `
      <h2>The Science Behind Massage Therapy: Why Your Body Needs It</h2>
      <p>In our fast-paced world, massage therapy isn't just a luxury—it's a necessity for maintaining physical and mental health. Let's explore the science-backed benefits.</p>

      <h3>Stress Reduction and Mental Health</h3>
      <p>Massage therapy reduces cortisol levels while increasing serotonin and dopamine. Regular sessions can significantly improve mood and reduce anxiety.</p>

      <h3>Pain Management</h3>
      <p>Studies show massage therapy effectively reduces chronic pain, muscle tension, and inflammation. It's particularly beneficial for conditions like fibromyalgia and arthritis.</p>

      <h3>Improved Circulation</h3>
      <p>The pressure and movement of massage improve blood flow, delivering oxygen and nutrients to tissues while removing metabolic waste.</p>

      <h3>Enhanced Immune Function</h3>
      <p>Regular massage has been shown to increase white blood cell count and improve lymphatic drainage, boosting your body's natural defenses.</p>

      <h3>Better Sleep Quality</h3>
      <p>Massage promotes relaxation and reduces insomnia by regulating sleep hormones and reducing physical discomfort that interferes with rest.</p>

      <h3>Increased Flexibility and Range of Motion</h3>
      <p>By breaking up muscle adhesions and improving tissue elasticity, massage therapy can significantly improve mobility and athletic performance.</p>

      <h3>Different Types of Massage</h3>
      <ul>
        <li><strong>Swedish:</strong> Relaxation and stress relief</li>
        <li><strong>Deep Tissue:</strong> Chronic pain and muscle tension</li>
        <li><strong>Sports:</strong> Athletic performance and injury prevention</li>
        <li><strong>Hot Stone:</strong> Deep relaxation and circulation</li>
        <li><strong>Aromatherapy:</strong> Emotional and physical healing</li>
      </ul>

      <p>At Zavira, our licensed massage therapists customize each session to your specific needs. Whether you're seeking relaxation or therapeutic benefits, we have the perfect treatment for you.</p>
    `
  },
  {
    id: 5,
    title: 'Sustainable Beauty Practices',
    excerpt: 'How to maintain your beauty routine while being environmentally conscious.',
    image: '/images/product-2.jpg',
    date: '2024-08-12',
    author: 'Zavira Team',
    category: 'Sustainability',
    readTime: '4 min read',
    content: `
      <h2>Going Green: Sustainable Beauty Practices for Conscious Consumers</h2>
      <p>In today's world, beauty lovers are increasingly seeking ways to look good while doing good for the planet. Sustainable beauty isn't just a trend—it's a movement that's here to stay.</p>

      <h3>Why Sustainable Beauty Matters</h3>
      <p>The beauty industry has a significant environmental impact, from plastic waste to chemical pollution. By choosing sustainable products and practices, you're making a positive difference.</p>

      <h3>Key Sustainable Practices</h3>
      <ul>
        <li><strong>Choose Eco-Friendly Packaging:</strong> Look for brands using recycled materials, glass, or biodegradable packaging</li>
        <li><strong>Opt for Natural Ingredients:</strong> Seek out products with plant-based, organic ingredients</li>
        <li><strong>Reduce Water Usage:</strong> Take shorter showers and use water-saving techniques</li>
        <li><strong>Recycle and Reuse:</strong> Properly dispose of beauty products and repurpose containers</li>
      </ul>

      <h3>Sustainable Salon Visits</h3>
      <p>At Zavira, we prioritize sustainability in our operations. From energy-efficient lighting to biodegradable cleaning products, we're committed to eco-friendly practices.</p>

      <p>Join us in making beauty sustainable—one conscious choice at a time.</p>
    `
  },
  {
    id: 6,
    title: 'Anti-Aging Treatments Guide',
    excerpt: 'Explore the latest anti-aging treatments and their effectiveness.',
    image: '/images/product-3.jpg',
    date: '2024-09-01',
    author: 'Dr. Elena Vasquez',
    category: 'Skin Care',
    readTime: '10 min read',
    content: `
      <h2>The Complete Guide to Anti-Aging Treatments</h2>
      <p>As we age, our skin undergoes natural changes. The good news? There are numerous effective treatments to maintain youthful, radiant skin.</p>

      <h3>Understanding Skin Aging</h3>
      <p>Skin aging is influenced by genetics, lifestyle, and environmental factors. Understanding these factors helps in choosing the right treatments.</p>

      <h3>Top Anti-Aging Treatments</h3>
      <ul>
        <li><strong>Retinoids:</strong> Vitamin A derivatives that stimulate collagen production</li>
        <li><strong>Hyaluronic Acid:</strong> Hydrates and plumps the skin</li>
        <li><strong>Peptides:</strong> Amino acid chains that support skin structure</li>
        <li><strong>Antioxidants:</strong> Protect against free radical damage</li>
      </ul>

      <h3>Professional Treatments at Zavira</h3>
      <p>Our anti-aging treatments combine the latest technology with expert care. From chemical peels to laser therapy, we offer comprehensive solutions.</p>

      <p>Consult with our specialists to create a personalized anti-aging plan that works for you.</p>
    `
  },
  {
    id: 7,
    title: 'Piercing Aftercare Tips',
    excerpt: 'Essential aftercare tips for new piercings to ensure proper healing.',
    image: '/images/product-4.jpg',
    date: '2024-07-28',
    author: 'Zavira Team',
    category: 'Piercings',
    readTime: '5 min read',
    content: `
      <h2>Piercing Aftercare: Your Guide to Proper Healing</h2>
      <p>A new piercing is an exciting milestone, but proper aftercare is crucial for preventing infection and ensuring beautiful results.</p>

      <h3>Immediate Aftercare</h3>
      <p>The first 24 hours are critical. Keep the area clean and avoid touching the piercing unnecessarily.</p>

      <h3>Daily Cleaning Routine</h3>
      <ul>
        <li>Wash hands before touching the piercing</li>
        <li>Use saline solution or gentle soap</li>
        <li>Avoid alcohol-based cleaners initially</li>
        <li>Pat dry with clean gauze</li>
      </ul>

      <h3>What to Avoid</h3>
      <p>During healing, avoid swimming, hot tubs, and changing the jewelry yourself. These can introduce bacteria or cause irritation.</p>

      <h3>Healing Timeline</h3>
      <p>Different piercings heal at different rates. Ear lobes typically heal in 6-8 weeks, while cartilage may take 3-12 months.</p>

      <p>At Zavira, our piercing specialists provide detailed aftercare instructions and follow-up care to ensure your piercing heals perfectly.</p>
    `
  },
  {
    id: 8,
    title: 'Tattoo Care and Maintenance',
    excerpt: 'How to properly care for your new tattoo for optimal healing and longevity.',
    image: '/images/product-5.jpg',
    date: '2024-06-15',
    author: 'James Chen',
    category: 'Tattoos',
    readTime: '6 min read',
    content: `
      <h2>Tattoo Aftercare: Keeping Your Ink Looking Fresh</h2>
      <p>A tattoo is a lifelong commitment that requires proper care during healing and ongoing maintenance.</p>

      <h3>The Healing Process</h3>
      <p>Tattoo healing typically takes 2-4 weeks. During this time, your skin is vulnerable and requires special attention.</p>

      <h3>Essential Aftercare Steps</h3>
      <ul>
        <li><strong>Keep it Clean:</strong> Gently wash with mild soap and water</li>
        <li><strong>Moisturize:</strong> Apply a thin layer of ointment as recommended</li>
        <li><strong>Protect from Sun:</strong> Avoid direct sunlight and use SPF</li>
        <li><strong>Avoid Irritants:</strong> No swimming, hot tubs, or tight clothing</li>
      </ul>

      <h3>Signs of Infection</h3>
      <p>Watch for excessive redness, swelling, pus, or fever. Contact your artist or healthcare provider if you notice these symptoms.</p>

      <h3>Long-Term Care</h3>
      <p>Once healed, regular moisturizing and sun protection will keep your tattoo vibrant for years to come.</p>

      <p>At Zavira, we use only the highest quality inks and provide comprehensive aftercare guidance for every tattoo.</p>
    `
  }
];

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === parseInt(id || '0'));

  if (!post) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-32 pb-24 px-8">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-serif luxury-glow mb-4">Post Not Found</h1>
            <Link to="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <div className="pt-32 pb-24 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link to="/blog" className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          {/* Hero Image */}
          <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-full">{post.category}</span>
              <span className="text-sm text-white/60">{post.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif luxury-glow mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-white/60 text-sm">
              <span>{post.date}</span>
              <span className="mx-2">•</span>
              <span>By {post.author}</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
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

export default BlogPost;