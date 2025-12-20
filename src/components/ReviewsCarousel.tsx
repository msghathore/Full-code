import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/hooks/use-language';

gsap.registerPlugin(ScrollTrigger);

const getReviews = (language: string) => [
  {
    name: 'Sarah Johnson',
    text: language === 'fr' ? 'Expérience absolument époustouflante ! L\'attention aux détails est inégalée.' : 'Absolutely stunning experience! The attention to detail is unmatched.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    text: language === 'fr' ? 'Service exceptionnel et résultats incroyables. Je recommande vivement !' : 'Exceptional service and incredible results. Highly recommend!',
    rating: 5
  },
  {
    name: 'Emma Williams',
    text: language === 'fr' ? 'Zavira a transformé mon expérience beauté. Personnel professionnel et attentionné.' : 'Zavira transformed my beauty experience. Professional and caring staff.',
    rating: 5
  }
];

export const ReviewsCarousel = React.memo(() => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { language, t } = useLanguage();
  const reviews = getReviews(language);

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

    // Scroll-driven fade-in animation
    gsap.fromTo(sectionRef.current, {
      opacity: 0,
      y: 50
    }, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-24 overflow-hidden bg-black/50" aria-labelledby="reviews-heading">
      <div className="mb-12 text-center px-4">
        <h2 id="reviews-heading" className="text-3xl md:text-6xl font-serif luxury-glow mb-4">
          {language === 'fr' ? 'Ce Que Disent Nos Clients' : 'What Our Clients Say'}
        </h2>
        <p className="text-muted-foreground text-sm md:text-lg tracking-wider">
          {language === 'fr' ? 'Témoignages de nos précieux invités' : 'Testimonials from our valued guests'}
        </p>
      </div>

      <div className="relative" role="region" aria-label="Client testimonials carousel">
        <div ref={carouselRef} className="flex space-x-4 md:space-x-8" style={{ width: 'max-content' }} role="list">
          {[...reviews, ...reviews].map((review, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[300px] md:w-[400px] frosted-glass border border-white/10 rounded-3xl p-6 md:p-8 cursor-hover hover:border-white/30 transition-all duration-500"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl md:text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-serif luxury-glow">{review.name}</h3>
                  <div className="flex mt-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm md:text-base">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground italic text-sm md:text-base">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
