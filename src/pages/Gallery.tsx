import { BeforeAfterGallery } from '@/components/hormozi/BeforeAfterGallery';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Gallery() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-black via-slate-950 to-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-8 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Hero Content */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Transformation Gallery
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
              Before & After
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Witness the artistry and expertise of our talented team. Each transformation
              tells a unique story of confidence, beauty, and self-expression.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={() => navigate('/booking')}
                className="bg-white hover:bg-white/90 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-white/50 transition-all"
              >
                Book Your Transformation
              </Button>
              <Button
                onClick={() => navigate('/services')}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-white px-8 py-6 text-lg font-semibold transition-all"
              >
                View All Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <BeforeAfterGallery showFilters={true} gridCols="triple" />
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-t from-black via-slate-950 to-black py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
            Ready for Your Transformation?
          </h2>

          <p className="text-xl text-slate-300 leading-relaxed">
            Join hundreds of satisfied clients who've discovered their best look at Zavira.
            Book your appointment today and experience the difference.
          </p>

          <Button
            onClick={() => navigate('/booking')}
            size="lg"
            className="bg-white hover:bg-white/90 text-white px-10 py-7 text-xl font-bold shadow-2xl hover:shadow-white/50 transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Book Now
          </Button>

          {/* Contact Info */}
          <div className="pt-8 border-t border-slate-800 mt-8">
            <p className="text-slate-400">
              Questions? Call us at{' '}
              <a
                href="tel:+14318163330"
                className="text-white hover:text-white/80 font-semibold transition-colors"
              >
                (431) 816-3330
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
