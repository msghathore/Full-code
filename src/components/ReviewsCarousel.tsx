import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/hooks/use-language';

gsap.registerPlugin(ScrollTrigger);

const getReviews = (language: string) => [
  {
    type: 'text',
    name: 'Sarah Johnson',
    image: '/images/client-1.jpg',
    text: language === 'fr' ? 'Expérience absolument époustouflante ! L\'attention aux détails est inégalée.' : 'Absolutely stunning experience! The attention to detail is unmatched.',
    rating: 5
  },
  {
    type: 'video',
    name: 'Michael Chen',
    videoUrl: '/videos/hero-video.mp4', // Using existing video as placeholder
    text: language === 'fr' ? 'Regardez ma transformation incroyable !' : 'Watch my incredible transformation!',
    rating: 5,
    thumbnail: '/images/client-2.jpg'
  },
  {
    type: 'gallery',
    name: 'Emma Williams',
    images: ['/images/client-3.jpg', '/images/product-1.jpg', '/images/product-2.jpg'],
    text: language === 'fr' ? 'Avant et après mes soins - résultats époustouflants !' : 'Before and after my treatments - stunning results!',
    rating: 5
  },
  {
    type: 'text',
    name: 'David Martinez',
    image: '/images/client-4.jpg',
    text: language === 'fr' ? 'Service et résultats exceptionnels. Ça vaut chaque centime !' : 'Exceptional service and results. Worth every penny!',
    rating: 5
  },
  {
    type: 'video',
    name: 'Sophie Anderson',
    videoUrl: '/videos/service-reference.mp4', // Using existing video as placeholder
    text: language === 'fr' ? 'Découvrez pourquoi Zavira est mon salon préféré !' : 'Discover why Zavira is my favorite salon!',
    rating: 5,
    thumbnail: '/images/client-5.jpg'
  },
  {
    type: 'gallery',
    name: 'Lisa Thompson',
    images: ['/images/product-3.jpg', '/images/product-4.jpg', '/images/product-5.jpg'],
    text: language === 'fr' ? 'Ma collection de produits préférés de Zavira !' : 'My favorite Zavira products collection!',
    rating: 5
  }
];

export const ReviewsCarousel = () => {
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
      <div className="mb-16 text-center">
        <h2 id="reviews-heading" className="text-5xl md:text-6xl font-serif luxury-glow mb-4">
          {language === 'fr' ? 'Ce Que Disent Nos Clients' : 'What Our Clients Say'}
        </h2>
        <p className="text-muted-foreground text-lg tracking-wider">
          {language === 'fr' ? 'Témoignages de nos précieux invités' : 'Testimonials from our valued guests'}
        </p>
      </div>

      <div className="relative" role="region" aria-label="Client testimonials carousel">
        <div ref={carouselRef} className="flex space-x-8" style={{ width: 'max-content' }} role="list">
          {[...reviews, ...reviews].map((review, index) => (
             <div
               key={index}
               className="flex-shrink-0 w-[400px] frosted-glass border border-white/10 rounded-lg p-8 cursor-hover hover:border-white/30 transition-all duration-500"
             >
               {review.type === 'video' ? (
                 <div className="mb-6">
                   <video
                     src={review.videoUrl}
                     poster={review.thumbnail}
                     controls
                     className="w-full h-32 object-cover rounded-lg mb-4"
                     preload="metadata"
                   />
                   <div className="flex items-center">
                     <img
                       src={review.thumbnail}
                       alt={review.name}
                       loading="lazy"
                       className="w-12 h-12 rounded-full object-cover mr-3 ring-2 ring-white/20"
                       style={{
                         boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                       }}
                     />
                     <div>
                       <h3 className="text-lg font-serif luxury-glow">{review.name}</h3>
                       <div className="flex mt-1">
                         {[...Array(review.rating)].map((_, i) => (
                           <span key={i} className="text-yellow-400 text-sm">★</span>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               ) : review.type === 'gallery' ? (
                 <div className="mb-6">
                   <div className="grid grid-cols-3 gap-2 mb-4">
                     {review.images.map((img, imgIndex) => (
                       <img
                         key={imgIndex}
                         src={img}
                         alt={`${review.name} gallery ${imgIndex + 1}`}
                         loading="lazy"
                         className="w-full h-16 object-cover rounded"
                       />
                     ))}
                   </div>
                   <div className="flex items-center">
                     <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
                       <span className="text-white text-lg">📸</span>
                     </div>
                     <div>
                       <h3 className="text-lg font-serif luxury-glow">{review.name}</h3>
                       <div className="flex mt-1">
                         {[...Array(review.rating)].map((_, i) => (
                           <span key={i} className="text-yellow-400 text-sm">★</span>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="flex items-center mb-6">
                   <img
                     src={review.image}
                     alt={review.name}
                     loading="lazy"
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
               )}
               <p className="text-muted-foreground italic">"{review.text}"</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};
