import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product360Viewer } from '@/components/Product360Viewer';
import { SubscriptionBoxes } from '@/components/SubscriptionBoxes';
import { GiftCardSystem } from '@/components/GiftCardSystem';
import { Search, ShoppingCart, Heart, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categories = ['All', 'Hair Care', 'Skin Care', 'Nail Care', 'Makeup', 'Tools'];

const products = [
  {
    id: 1,
    name: 'Luxury Hair Serum',
    category: 'Hair Care',
    price: 89,
    images: ['/images/product-1.jpg', '/images/product-1.jpg', '/images/product-1.jpg', '/images/product-1.jpg'], // Multiple images for 360° view
    description: 'Nourish and repair your hair with our premium serum infused with argan oil and keratin.',
    stockQuantity: 25,
    isWishlisted: false
  },
  {
    id: 2,
    name: 'Premium Face Cream',
    category: 'Skin Care',
    price: 120,
    images: ['/images/product-2.jpg', '/images/product-2.jpg', '/images/product-2.jpg', '/images/product-2.jpg'],
    description: 'Hydrate and rejuvenate your skin with this luxurious cream containing hyaluronic acid and vitamin C.',
    stockQuantity: 15,
    isWishlisted: false
  },
  {
    id: 3,
    name: 'Nail Polish Set',
    category: 'Nail Care',
    price: 45,
    images: ['/images/product-3.jpg', '/images/product-3.jpg', '/images/product-3.jpg', '/images/product-3.jpg'],
    description: 'A set of 6 long-lasting, chip-resistant nail polishes in trendy colors.',
    stockQuantity: 8,
    isWishlisted: false
  },
  {
    id: 4,
    name: 'Hydrating Shampoo',
    category: 'Hair Care',
    price: 65,
    images: ['/images/product-4.jpg', '/images/product-4.jpg', '/images/product-4.jpg', '/images/product-4.jpg'],
    description: 'Deeply cleanse and hydrate your hair with this sulfate-free shampoo enriched with aloe vera.',
    stockQuantity: 30,
    isWishlisted: false
  },
  {
    id: 5,
    name: 'Anti-Aging Serum',
    category: 'Skin Care',
    price: 150,
    images: ['/images/product-5.jpg', '/images/product-5.jpg', '/images/product-5.jpg', '/images/product-5.jpg'],
    description: 'Reduce fine lines and wrinkles with our advanced serum featuring retinol and peptides.',
    stockQuantity: 12,
    isWishlisted: false
  },
  {
    id: 6,
    name: 'Makeup Brush Set',
    category: 'Makeup',
    price: 95,
    images: ['/images/product-6.jpg', '/images/product-6.jpg', '/images/product-6.jpg', '/images/product-6.jpg'],
    description: 'Professional-grade makeup brushes for flawless application, made with synthetic bristles.',
    stockQuantity: 5,
    isWishlisted: false
  },
];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const updated = existing
        ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...product, quantity: 1 }];

      // Persist to localStorage
      localStorage.setItem('zavira-cart', JSON.stringify(updated));

      return updated;
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => {
      const isWishlisted = prev.includes(productId);
      const newWishlist = isWishlisted
        ? prev.filter(id => id !== productId)
        : [...prev, productId];

      // Persist to localStorage
      localStorage.setItem('zavira-wishlist', JSON.stringify(newWishlist));

      toast({
        title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
        description: isWishlisted
          ? "Product has been removed from your wishlist."
          : "Product has been added to your wishlist.",
      });

      return newWishlist;
    });
  };

  // Load wishlist and cart from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('zavira-wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    const savedCart = localStorage.getItem('zavira-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <div className="pt-32 pb-24 px-2 sm:px-4 md:px-8">
      <div className="container mx-auto max-w-none">
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow mb-4">
            LUXURY SHOP
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg tracking-wider">
            Premium beauty products for home care
          </p>
        </div>

        {/* Search Bar and Cart */}
        <div className="max-w-none sm:max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12">
          <div className="flex gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border-white/20 text-white placeholder:text-white/30 pl-10 sm:pl-12 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg"
              />
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <Button
              onClick={() => window.location.href = '/shop/checkout'}
              variant="outline"
              className="relative bg-black/50 border-white/20 text-white hover:bg-white/10 px-3 sm:px-4 shrink-0"
              disabled={cart.length === 0}
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12 md:mb-16 px-2">
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`text-xs sm:text-sm md:text-base px-2 sm:px-4 py-1.5 sm:py-2 ${selectedCategory === category ? "bg-white text-black border-white hover:bg-white/90" : ""}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => openProductModal(product)}
              className="group frosted-glass border border-white/10 rounded-[10%] overflow-hidden hover:border-white/30 transition-all duration-500 cursor-hover hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-white/20 hover:z-10"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="aspect-square overflow-hidden relative rounded-[10%]">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-125 group-hover:contrast-110"
                  style={{
                    filter: 'brightness(1.2)',
                    borderRadius: '10%'
                  }}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: 'inset 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.4)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    borderRadius: '10%'
                  }}
                />
                {/* Wishlist button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full transition-all duration-300 ${
                    wishlist.includes(product.id) ? 'text-red-400' : 'text-white/70'
                  }`}
                >
                  <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              <div className="p-3 sm:p-4 md:p-6 text-center">
                <p className="text-xs sm:text-sm md:text-base text-white/60 tracking-wider mb-1.5 sm:mb-2 font-bold">{product.category}</p>
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif luxury-glow mb-3 sm:mb-4 font-bold leading-tight">{product.name}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg sm:text-xl md:text-2xl text-white font-bold">${product.price}</span>
                  <div className="text-xs text-right">
                    <div className={`font-semibold ${product.stockQuantity <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                      {product.stockQuantity <= 5 ? 'Low Stock' : 'In Stock'}
                    </div>
                    <div className="text-white/60">{product.stockQuantity} left</div>
                  </div>
                </div>
                <Button
                  variant="cta"
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  disabled={product.stockQuantity === 0}
                  className="w-full text-xs sm:text-sm py-2 sm:py-2.5"
                >
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Boxes Section */}
      <SubscriptionBoxes />

      {/* Gift Card System Section */}
      <GiftCardSystem />

      {/* Product Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl w-[95vw] md:w-[90vw] bg-black border-white/20">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-serif luxury-glow">{selectedProduct?.name}</DialogTitle>
            <DialogDescription className="text-white/60 text-sm sm:text-base">{selectedProduct?.category}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <Product360Viewer
                images={selectedProduct?.images || []}
                alt={selectedProduct?.name || ''}
                className="w-full h-40 sm:h-48 md:h-64"
              />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">{selectedProduct?.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">${selectedProduct?.price}</span>
                <Button variant="cta" onClick={() => { addToCart(selectedProduct); setShowModal(false); }} className="text-xs sm:text-sm px-3 sm:px-4 py-2">
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;
