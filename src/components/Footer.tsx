import { useLanguage } from '@/hooks/use-language';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

export const Footer = () => {
  console.log('Footer rendering');
  const { language, setLanguage, t } = useLanguage();

  const footerSections = [{
    title: t('services'),
    links: [
      { name: t('hair'), path: '/services#hair' },
      { name: t('nails'), path: '/services#nails' },
      { name: t('skin'), path: '/services#skin' },
      { name: t('massage'), path: '/services#massage' },
      { name: t('tattoo'), path: '/services#tattoo' },
      { name: t('piercing'), path: '/services#piercing' }
    ]
  }, {
    title: t('company'),
    links: [
      { name: t('aboutUs'), path: '/about' },
      { name: t('careers'), path: '/careers' },
      { name: t('blog'), path: '/blog' }
    ]
  }, {
    title: t('support'),
    links: [
      { name: t('contact'), path: '/contact' },
      { name: t('faqs'), path: '/faqs' },
      { name: t('privacy'), path: '/privacy' },
      { name: t('terms'), path: '/terms' },
      { name: t('cookiePolicy'), path: '/cookies' }
    ]
  }, {
    title: t('followUs'),
    links: [
      { name: 'Instagram', path: '#', external: true },
      { name: 'Facebook', path: '#', external: true },
      { name: 'Twitter', path: '#', external: true },
      { name: 'YouTube', path: '#', external: true }
    ]
  }];
  return <footer className="relative border-t border-white/10 overflow-hidden no-animations bg-black" role="contentinfo" aria-label="Site footer">
     <div className="container mx-auto container-padding relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="text-3xl md:text-4xl font-serif font-light text-white" role="banner" aria-label="Zavira Salon and Spa">
            ZAVIRA
          </div>
          <div className="text-sm md:text-base text-white/70 mt-1 font-light tracking-wider">
            SALON & SPA
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-6 md:mb-8">
          {footerSections.map((section, index) => <div key={section.title} className="">
              <h3 className="text-footer-title mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {section.links.map((link, linkIndex) => <li key={link.name} className="">
                    {link.external ? (
                      <a
                        href={link.path}
                        className="text-footer-link footer-link hover:text-white cursor-hover block"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-footer-link footer-link hover:text-white cursor-hover block"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>)}
              </ul>
            </div>)}
        </div>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6 mb-6">
          <a
            href="#"
            className="text-white/70 hover:text-white transition-colors duration-300"
            aria-label="Follow us on Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="#"
            className="text-white/70 hover:text-white transition-colors duration-300"
            aria-label="Follow us on Facebook"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="#"
            className="text-white/70 hover:text-white transition-colors duration-300"
            aria-label="Follow us on Twitter"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="#"
            className="text-white/70 hover:text-white transition-colors duration-300"
            aria-label="Subscribe to our YouTube channel"
          >
            <Youtube className="w-6 h-6" />
          </a>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className="rounded-lg hover:scale-110 transition-transform duration-500 shadow-lg hover:shadow-white/30"
            aria-label={`Switch to ${language === 'en' ? 'French' : 'English'} language`}
          >
            {language === 'en' ? 'FRENCH' : 'ENGLISH'}
          </Button>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-col md:flex-row justify-center items-center text-xs text-muted-foreground">
            <p className="transition-all duration-300 hover:text-white hover:tracking-wider">{t('copyright')}</p>
          </div>
        </div>
      </div>
    </footer>;
};