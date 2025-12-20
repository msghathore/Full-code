import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollIntoViewFast } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import {
  FadeInUp,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  ParallaxSection,
} from '@/components/animations';
import { useLanguage } from '@/hooks/use-language';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
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

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

const About = () => {
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
      <div className="container mx-auto max-w-4xl">
        {/* Animated Header */}
        <div className="text-center mb-12 sm:mb-16">
          <FadeInUp>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif luxury-glow mb-4">
              {t('aboutUsTitle')}
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-base sm:text-lg text-muted-foreground">
              {t('aboutSubtitle')}
            </p>
          </FadeInUp>
        </div>

        {/* Animated Cards with Stagger */}
        <motion.div
          className="space-y-8 sm:space-y-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Our Story Card */}
          <motion.div
            id="story"
            className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-8 scroll-mt-24"
            variants={cardVariants}
            whileHover={{
              y: -5,
              boxShadow: '0 20px 40px rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              transition: { duration: 0.3 },
            }}
          >
            <TextReveal>
              <h2 className="text-xl sm:text-3xl font-serif luxury-glow mb-4">{t('ourStory')}</h2>
            </TextReveal>
            <motion.p
              className="text-sm sm:text-base text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {t('ourStoryText')}
            </motion.p>
          </motion.div>

          {/* Philosophy Card */}
          <motion.div
            className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-8"
            variants={cardVariants}
            whileHover={{
              y: -5,
              boxShadow: '0 20px 40px rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              transition: { duration: 0.3 },
            }}
          >
            <TextReveal>
              <h2 className="text-xl sm:text-3xl font-serif luxury-glow mb-4">{t('ourPhilosophy')}</h2>
            </TextReveal>
            <motion.p
              className="text-sm sm:text-base text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {t('ourPhilosophyText')}
            </motion.p>
          </motion.div>

          {/* Why Choose Us Card */}
          <motion.div
            className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-8"
            variants={cardVariants}
            whileHover={{
              y: -5,
              boxShadow: '0 20px 40px rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              transition: { duration: 0.3 },
            }}
          >
            <TextReveal>
              <h2 className="text-xl sm:text-3xl font-serif luxury-glow mb-4">{t('whyChooseUs')}</h2>
            </TextReveal>
            <motion.ul
              className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                t('whyChooseUs1'),
                t('whyChooseUs2'),
                t('whyChooseUs3'),
                t('whyChooseUs4'),
              ].map((item, index) => (
                <motion.li
                  key={index}
                  className="flex items-start"
                  variants={listItemVariants}
                  whileHover={{ x: 10, transition: { duration: 0.2 } }}
                >
                  <motion.span
                    className="luxury-glow mr-3"
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(255,255,255,0.5)',
                        '0 0 20px rgba(255,255,255,0.8)',
                        '0 0 10px rgba(255,255,255,0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    •
                  </motion.span>
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>

        {/* Animated Divider */}
        <motion.div
          className="my-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
        />
      </div>

      <Footer />
    </div>
  );
};

export default About;
