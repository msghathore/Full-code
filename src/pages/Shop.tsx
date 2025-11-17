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
      
      <div className="pt-32 pb-24 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow mb-4">
              LUXURY SHOP
            </h1>
            <p className="text-muted-foreground text-base md:text-lg tracking-wider">
              Premium beauty products for home care
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 md:mb-12">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border-white/20 text-white placeholder:text-white/30 pl-12 py-4 md:py-6 text-base md:text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12 md:mb-16">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-full border transition-all cursor-hover text-sm md:text-base ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="group frosted-glass border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-500 cursor-hover"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    style={{
                      filter: 'brightness(0.8)',
                    }}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: 'inset 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.4)',
                      border: '2px solid rgba(255,255,255,0.5)',
                    }}
                  />
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-xs md:text-sm text-white/60 tracking-wider mb-2">{product.category}</p>
                  <h3 className="text-xl md:text-2xl font-serif luxury-glow mb-4">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg md:text-xl text-white font-light">${product.price}</span>
                    <Button className="bg-white text-black hover:bg-white/90 cursor-hover text-sm md:text-base">
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
