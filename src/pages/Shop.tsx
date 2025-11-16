import { useState } from 'react';
import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const categories = ['All', 'Hair Care', 'Skin Care', 'Nail Care', 'Makeup', 'Tools'];

const products = [
  { id: 1, name: 'Luxury Hair Serum', category: 'Hair Care', price: 89, image: '/images/product-1.jpg' },
  { id: 2, name: 'Premium Face Cream', category: 'Skin Care', price: 120, image: '/images/product-2.jpg' },
  { id: 3, name: 'Nail Polish Set', category: 'Nail Care', price: 45, image: '/images/product-3.jpg' },
  { id: 4, name: 'Hydrating Shampoo', category: 'Hair Care', price: 65, image: '/images/product-4.jpg' },
  { id: 5, name: 'Anti-Aging Serum', category: 'Skin Care', price: 150, image: '/images/product-5.jpg' },
  { id: 6, name: 'Makeup Brush Set', category: 'Makeup', price: 95, image: '/images/product-6.jpg' },
];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      <CustomCursor />
      <Navigation />
      
      <div className="pt-32 pb-24 px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-serif luxury-glow mb-4">
              LUXURY SHOP
            </h1>
            <p className="text-muted-foreground text-lg tracking-wider">
              Premium beauty products for home care
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border-white/20 text-white placeholder:text-white/30 pl-12 py-6 text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full border transition-all cursor-hover ${
                  selectedCategory === category
                    ? 'bg-white text-black border-white'
                    : 'border-white/20 text-white hover:border-white/40 hover:bg-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="group frosted-glass border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-500 cursor-hover"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 image-hover-glow"
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm text-white/60 tracking-wider mb-2">{product.category}</p>
                  <h3 className="text-2xl font-serif luxury-glow mb-4">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl text-white font-light">${product.price}</span>
                    <Button className="bg-white text-black hover:bg-white/90 cursor-hover">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
