import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product360Viewer } from '@/components/Product360Viewer';
// import { SubscriptionBoxes } from '@/components/SubscriptionBoxes'; // Hidden for now
import { GiftCardSystem } from '@/components/GiftCardSystem';
import { Search, ShoppingCart, Heart, ShoppingBag, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FadeInUp, MagneticButton } from '@/components/animations';
import { useLanguage } from '@/hooks/use-language';

// Animation variants for shop
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
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

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 400 } },
  tap: { scale: 0.95 }
};

const categories = ['All', 'Hair Care', 'Skin Care', 'Nail Care', 'Makeup', 'Tools', 'Body Care'];

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock_quantity: number | null;
  sku: string | null;
  brand: string | null;
  weight: string | null;
  ingredients: string | null;
  usage_instructions: string | null;
  average_rating: number | null;
  review_count: number | null;
  featured: boolean | null;
  sale_price: number | null;
  is_active: boolean | null;
}

interface ProductReview {
  id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  review_text: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Set category from URL parameter
  useEffect(() => {
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false })
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast({
        title: t('error'),
        description: t('failedToLoadProducts'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async (productId: string) => {
    try {
      setReviewsLoading(true);
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('helpful_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      setProductReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setProductReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Search suggestions - show all products matching the search query (ignoring category filter)
  const searchSuggestions = searchQuery.length > 0
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5) // Limit to 5 suggestions
    : [];

  const openProductModal = async (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
    await fetchProductReviews(product.id);
  };

  const handleSearchSelect = (product: Product) => {
    setSearchQuery(product.name);
    setShowSearchDropdown(false);
    // Also set category to match the product's category for better UX
    setSelectedCategory(product.category);
    // Open the product modal
    openProductModal(product);
  };

  const [cartBounce, setCartBounce] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const updated = existing
        ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...product, quantity: 1 }];

      // Persist to localStorage
      localStorage.setItem('zavira-cart', JSON.stringify(updated));

      return updated;
    });
    // Animate cart badge instead of showing toast
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 300);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const isWishlisted = prev.includes(productId);
      const newWishlist = isWishlisted
        ? prev.filter(id => id !== productId)
        : [...prev, productId];

      // Persist to localStorage
      localStorage.setItem('zavira-wishlist', JSON.stringify(newWishlist));

      toast({
        title: isWishlisted ? t('removedFromWishlist') : t('addedToWishlist'),
        description: isWishlisted
          ? t('productRemovedWishlist')
          : t('productAddedWishlist'),
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-2 sm:px-4 md:px-8 min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loadingProducts')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 px-2 sm:px-4 md:px-8 bg-background">
      <div className="container mx-auto max-w-none">
        <div className="text-center mb-8 md:mb-16">
          <FadeInUp>
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow mb-4"
              animate={{
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.5)',
                  '0 0 40px rgba(255,255,255,0.8)',
                  '0 0 20px rgba(255,255,255,0.5)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {t('luxuryShop')}
            </motion.h1>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg tracking-wider">
              {t('shopSubtitle')}
            </p>
          </FadeInUp>
        </div>

        {/* Search Bar and Cart */}
        <div className="max-w-none sm:max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12">
          <div className="flex gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Input
                id="product-search"
                name="product-search"
                type="search"
                inputMode="search"
                autoComplete="off"
                enterKeyHint="search"
                placeholder={t('searchProducts')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(e.target.value.length > 0);
                }}
                onFocus={() => {
                  setSearchFocused(true);
                  if (searchQuery.length > 0) setShowSearchDropdown(true);
                }}
                onBlur={() => {
                  setSearchFocused(false);
                  // Delay hiding dropdown to allow click events
                  setTimeout(() => setShowSearchDropdown(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-full bg-black/50 border-white/20 text-white placeholder:text-white/30 pl-10 sm:pl-12 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg"
              />
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4 sm:h-5 sm:w-5" />

              {/* Smart Search Dropdown */}
              {showSearchDropdown && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-sm">
                  {searchSuggestions.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSearchSelect(product)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent cursor-pointer transition-colors border-b border-border last:border-b-0"
                    >
                      <img
                        src={product.image_url || '/images/product-1.jpg'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-muted-foreground text-sm">{product.category} • ${product.price}</p>
                          {product.average_rating && product.average_rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-yellow-400 text-xs">{product.average_rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showSearchDropdown && searchQuery.length > 0 && searchSuggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl z-50 backdrop-blur-sm">
                  <div className="px-4 py-3 text-muted-foreground text-center">
                    {t('noProductsFoundFor', { query: searchQuery })}
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => window.location.href = '/shop/checkout'}
              variant="outline"
              className="relative bg-accent/50 border-border text-foreground hover:bg-accent px-3 sm:px-4 shrink-0"
              disabled={cart.length === 0}
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {cart.length > 0 && (
                <motion.span
                  className="absolute -top-2 -right-2 bg-foreground text-background text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  animate={cartBounce ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </motion.span>
              )}
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-12 md:mb-16 px-2"
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
                className={`text-xs sm:text-sm md:text-base px-2 sm:px-4 py-1.5 sm:py-2 transition-all duration-300 ${selectedCategory === category ? "bg-foreground text-background border-foreground hover:bg-foreground/90" : ""}`}
              >
                {category}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl text-foreground mb-2">{t('noProductsFound')}</h3>
            <p className="text-muted-foreground">{t('tryDifferentCategoryOrSearch')}</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={selectedCategory}
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                variants={cardVariants}
                onClick={() => openProductModal(product)}
                className="group frosted-glass border border-border rounded-[10%] overflow-hidden hover:border-foreground/30 transition-all duration-500 cursor-hover hover:z-10"
                style={{ transformStyle: 'preserve-3d' }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 25px 50px rgba(255, 255, 255, 0.15)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <div className="aspect-square overflow-hidden relative rounded-[10%]">
                  <img
                    src={product.image_url || '/images/product-1.jpg'}
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
                  {/* Featured badge */}
                  {product.featured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                      {t('featured')}
                    </div>
                  )}
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
                  {product.brand && (
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                  )}
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground tracking-wider mb-1.5 sm:mb-2 font-bold">{product.category}</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif luxury-glow mb-2 font-bold leading-tight text-foreground">{product.name}</h3>

                  {/* Rating */}
                  {product.average_rating && product.average_rating > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {renderStars(Math.round(product.average_rating))}
                      <span className="text-yellow-400 text-sm">({product.review_count})</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl md:text-2xl text-foreground font-bold">${product.price}</span>
                      {product.sale_price && (
                        <span className="text-sm text-red-400 line-through">${product.sale_price}</span>
                      )}
                    </div>
                    <div className="text-xs text-right">
                      <div className={`font-semibold ${(product.stock_quantity || 0) <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                        {(product.stock_quantity || 0) <= 5 ? t('lowStock') : t('inStock')}
                      </div>
                      <div className="text-muted-foreground">{product.stock_quantity || 0} {t('leftInStock')}</div>
                    </div>
                  </div>
                  <MagneticButton className="w-full">
                    <Button
                      variant="cta"
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      disabled={(product.stock_quantity || 0) === 0}
                      className="w-full text-xs sm:text-sm py-2 sm:py-2.5"
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      {(product.stock_quantity || 0) === 0 ? t('outOfStock') : t('addToCart')}
                    </Button>
                  </MagneticButton>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Subscription Boxes Section - Hidden for now */}
      {/* <SubscriptionBoxes /> */}

      {/* Gift Card System Section */}
      <GiftCardSystem />

      {/* Product Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl w-[95vw] md:w-[90vw] bg-background border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-serif luxury-glow text-foreground">{selectedProduct?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm sm:text-base">
              {selectedProduct?.brand && <span className="text-muted-foreground">{selectedProduct.brand} • </span>}
              {selectedProduct?.category}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <Product360Viewer
                images={selectedProduct?.image_url ? [selectedProduct.image_url, selectedProduct.image_url, selectedProduct.image_url, selectedProduct.image_url] : []}
                alt={selectedProduct?.name || ''}
                className="w-full h-40 sm:h-48 md:h-64"
              />

              {/* Product details */}
              {selectedProduct?.weight && (
                <p className="text-muted-foreground text-sm mt-2">{t('sizeLabel')} {selectedProduct.weight}</p>
              )}
              {selectedProduct?.sku && (
                <p className="text-muted-foreground text-xs mt-1">{t('skuLabel')} {selectedProduct.sku}</p>
              )}
            </div>
            <div className="space-y-3 sm:space-y-4">
              <p className="text-foreground text-xs sm:text-sm md:text-base leading-relaxed">{selectedProduct?.description}</p>

              {/* Ingredients */}
              {selectedProduct?.ingredients && (
                <div>
                  <h4 className="text-foreground font-semibold text-sm mb-1">{t('ingredients')}</h4>
                  <p className="text-muted-foreground text-xs">{selectedProduct.ingredients}</p>
                </div>
              )}

              {/* Usage Instructions */}
              {selectedProduct?.usage_instructions && (
                <div>
                  <h4 className="text-foreground font-semibold text-sm mb-1">{t('howToUse')}</h4>
                  <p className="text-muted-foreground text-xs">{selectedProduct.usage_instructions}</p>
                </div>
              )}

              {/* Rating in modal */}
              {selectedProduct?.average_rating && selectedProduct.average_rating > 0 && (
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(selectedProduct.average_rating))}
                  <span className="text-yellow-400">{selectedProduct.average_rating}</span>
                  <span className="text-muted-foreground">({selectedProduct.review_count} {t('reviews')})</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">${selectedProduct?.price}</span>
                <Button variant="cta" onClick={() => { if (selectedProduct) addToCart(selectedProduct); setShowModal(false); }} className="text-xs sm:text-sm px-3 sm:px-4 py-2">
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  {t('addToCart')}
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-lg font-serif text-foreground mb-4">{t('customerReviews')}</h3>
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : productReviews.length > 0 ? (
              <div className="space-y-4">
                {productReviews.map(review => (
                  <div key={review.id} className="bg-accent rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-medium">{review.customer_name}</span>
                        {review.is_verified_purchase && (
                          <span className="text-green-400 text-xs bg-green-400/10 px-2 py-0.5 rounded">{t('verified')}</span>
                        )}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    {review.title && (
                      <h4 className="text-foreground font-semibold text-sm mb-1">{review.title}</h4>
                    )}
                    <p className="text-muted-foreground text-sm">{review.review_text}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      {review.helpful_count > 0 && (
                        <span>{review.helpful_count} {t('foundHelpful')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">{t('noReviewsYet')}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;
