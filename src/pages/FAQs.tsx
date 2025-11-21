import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function FAQs() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "You can book an appointment through our online booking system, call us directly, or visit our salon. We recommend booking in advance to ensure your preferred time slot."
    },
    {
      question: "What are your operating hours?",
      answer: "We are open Monday through Saturday from 9:00 AM to 8:00 PM, and Sunday from 10:00 AM to 6:00 PM. Hours may vary on holidays."
    },
    {
      question: "Do you offer gift certificates?",
      answer: "Yes! We offer gift certificates for all our services and products. They make perfect gifts and can be purchased online or in person."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, credit cards (Visa, MasterCard, American Express), and digital payments including Apple Pay and Google Pay."
    },
    {
      question: "Do you have parking available?",
      answer: "Yes, we offer complimentary parking for our clients. We have a dedicated parking lot with ample spaces."
    },
    {
      question: "What is your cancellation policy?",
      answer: "We require 24-hour notice for cancellations. Late cancellations may incur a fee equal to 50% of the service price."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif luxury-glow mb-6 sm:mb-8 text-center">
          {t('faqs').toUpperCase()}
        </h1>
        
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Frequently asked questions about our salon & spa services.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-lg frosted-glass">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-4 sm:px-8 sm:py-6 text-left flex justify-between items-center hover:bg-white/5 transition-all cursor-hover"
              >
                <h3 className="text-base sm:text-lg md:text-xl text-white leading-tight">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white/60 flex-shrink-0 ml-2" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 sm:px-8 sm:pb-6">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Still have questions? We're here to help!
          </p>
          <Button>
            CONTACT US
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}