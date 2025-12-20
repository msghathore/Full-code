import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { scrollIntoViewFast } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { FadeInUp, FadeInLeft, FadeInRight, MagneticButton } from '@/components/animations';
import { useLanguage } from '@/hooks/use-language';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const inputVariants = {
  focus: {
    scale: 1.02,
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
    transition: { duration: 0.2 },
  },
};

const Contact = () => {
  const location = useLocation();
  const { t } = useLanguage();

  // Scroll to hash section on load
  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          scrollIntoViewFast(element, 400, 80);
        }
      }, 300);
    }
  }, [location.hash]);

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Animated Header */}
        <div className="text-center mb-12 sm:mb-16">
          <FadeInUp>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif luxury-glow mb-4">
              {t('contactUsTitle')}
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-sm sm:text-lg text-muted-foreground tracking-wider">
              {t('contactSubtitle')}
            </p>
          </FadeInUp>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Form - Slides in from left */}
          <FadeInLeft delay={0.3}>
            <motion.div
              className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-8 space-y-4 sm:space-y-6"
              whileHover={{
                boxShadow: '0 20px 40px rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3
                className="text-xl sm:text-2xl font-serif luxury-glow mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {t('sendUsMessage')}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <label className="text-xs sm:text-sm text-white/70 mb-2 block tracking-wider">{t('nameLabel')}</label>
                <motion.div whileFocus="focus" variants={inputVariants}>
                  <Input
                    placeholder={t('yourName')}
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30 transition-all duration-300 focus:border-white/40 focus:bg-black/60"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <label className="text-xs sm:text-sm text-white/70 mb-2 block tracking-wider">{t('email')}</label>
                <Input
                  type="email"
                  placeholder={t('yourEmail')}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30 transition-all duration-300 focus:border-white/40 focus:bg-black/60"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                <label className="text-xs sm:text-sm text-white/70 mb-2 block tracking-wider">{t('messageLabel')}</label>
                <Textarea
                  placeholder={t('messagePlaceholder')}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30 min-h-[120px] sm:min-h-[150px] transition-all duration-300 focus:border-white/40 focus:bg-black/60"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                <MagneticButton className="w-full">
                  <Button
                    variant="cta"
                    className="w-full font-serif text-base sm:text-lg tracking-wider py-4 sm:py-6"
                  >
                    {t('sendMessage')}
                  </Button>
                </MagneticButton>
              </motion.div>
            </motion.div>
          </FadeInLeft>

          {/* Contact Info - Staggered cards from right */}
          <motion.div
            className="space-y-4 sm:space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Address Card */}
            <motion.div
              className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-6"
              variants={cardVariants}
              whileHover={{
                x: 10,
                boxShadow: '0 10px 30px rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <div className="flex items-start">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                >
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 mt-1 luxury-glow" />
                </motion.div>
                <div>
                  <h4 className="text-lg sm:text-xl font-serif luxury-glow mb-2">{t('addressLabel')}</h4>
                  <a
                    href="https://maps.google.com/?q=283+Tache+Avenue,+Winnipeg,+MB,+Canada"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors underline-offset-2 hover:underline"
                  >
                    283 Tache Avenue<br />
                    Winnipeg, MB
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Phone Card */}
            <motion.div
              id="phone"
              className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-6 scroll-mt-24"
              variants={cardVariants}
              whileHover={{
                x: 10,
                boxShadow: '0 10px 30px rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <div className="flex items-start">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 mt-1 luxury-glow" />
                </motion.div>
                <div>
                  <h4 className="text-lg sm:text-xl font-serif luxury-glow mb-2">{t('phoneLabel')}</h4>
                  <a
                    href="tel:+14318163330"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors underline-offset-2 hover:underline"
                  >
                    (431) 816-3330
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Email Card */}
            <motion.div
              className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-6"
              variants={cardVariants}
              whileHover={{
                x: 10,
                boxShadow: '0 10px 30px rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <div className="flex items-start">
                <motion.div
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 mt-1 luxury-glow" />
                </motion.div>
                <div>
                  <h4 className="text-lg sm:text-xl font-serif luxury-glow mb-2">{t('emailLabel')}</h4>
                  <a
                    href="mailto:zavirasalonandspa@gmail.com"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors underline-offset-2 hover:underline"
                  >
                    zavirasalonandspa@gmail.com
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Hours Card */}
            <motion.div
              id="hours"
              className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-6 scroll-mt-24"
              variants={cardVariants}
              whileHover={{
                x: 10,
                boxShadow: '0 10px 30px rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <div className="flex items-start">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                >
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 mt-1 luxury-glow" />
                </motion.div>
                <div>
                  <h4 className="text-lg sm:text-xl font-serif luxury-glow mb-2">{t('hoursLabel')}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Daily: 8:00 AM - 11:30 PM
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
