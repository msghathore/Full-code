import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const reviews = [
  {
    name: 'Sarah Johnson',
    image: '/images/client-1.jpg',
    text: 'Absolutely stunning experience! The attention to detail is unmatched.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    image: '/images/client-2.jpg',
    text: 'Best salon in town. The staff is professional and the ambiance is luxurious.',
    rating: 5
  },
  {
    name: 'Emma Williams',
    image: '/images/client-3.jpg',
    text: 'I feel like royalty every time I visit. Highly recommend!',
    rating: 5
  },
  {
    name: 'David Martinez',
    image: '/images/client-4.jpg',
    text: 'Exceptional service and results. Worth every penny!',
    rating: 5
  },
  {
    name: 'Sophie Anderson',
    image: '/images/client-5.jpg',
    text: 'The spa treatments are heavenly. A true escape from daily life.',
    rating: 5
  }
];

export const ReviewsCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!carouselRef.current) return;

    const carousel = carouselRef.current;
    const totalWidth = carousel.scrollWidth / 2;

    gsap.to(carousel, {
      x: -totalWidth,
      duration: 40,
      ease: 'none',
      repeat: -1
    });
  }, []);

  return (
    <section className="py-24 overflow-hidden bg-black/50">
      <div className="mb-16 text-center">
        <h2 className="text-5xl md:text-6xl font-serif luxury-glow mb-4">
          What Our Clients Say
        </h2>
        <p className="text-muted-foreground text-lg tracking-wider">
          Testimonials from our valued guests
        </p>
      </div>

      <div className="relative">
        <div ref={carouselRef} className="flex space-x-8" style={{ width: 'max-content' }}>
          {[...reviews, ...reviews].map((review, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[400px] frosted-glass border border-white/10 rounded-lg p-8 cursor-hover hover:border-white/30 transition-all duration-500"
            >
              <div className="flex items-center mb-6">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-16 h-16 rounded-full object-cover mr-4 ring-2 ring-white/20"
                  style={{
                    boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                  }}
                />
                <div>
                  <h3 className="text-xl font-serif luxury-glow">{review.name}</h3>
                  <div className="flex mt-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
