export const Footer = () => {
  const footerSections = [
    {
      title: 'SERVICES',
      links: ['Hair', 'Nails', 'Skin', 'Massage', 'Tattoo', 'Piercing']
    },
    {
      title: 'COMPANY',
      links: ['About Us', 'Careers', 'Blog', 'Press']
    },
    {
      title: 'SUPPORT',
      links: ['Contact', 'FAQs', 'Privacy', 'Terms']
    },
    {
      title: 'FOLLOW US',
      links: ['Instagram', 'Facebook', 'Twitter', 'YouTube']
    }
  ];

  return (
    <footer className="relative bg-black border-t border-white/10 py-16">
      <div className="container mx-auto px-8">
        {/* Logo */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif tracking-widest luxury-glow">
            ZAVIRA
          </h2>
          <p className="text-sm text-muted-foreground mt-2 tracking-wider">
            SALON & SPA
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold tracking-wider mb-4 text-white">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-white hover:luxury-glow transition-all cursor-hover"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6 mb-8">
          {['YouTube', 'Facebook', 'Instagram', 'LinkedIn', 'Twitter'].map((social) => (
            <a
              key={social}
              href="#"
              className="text-muted-foreground hover:text-white hover:luxury-glow transition-all cursor-hover"
              aria-label={social}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {social[0]}
              </div>
            </a>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>© 2025 Zavira Salon & Spa. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition cursor-hover">Privacy Policy</a>
              <a href="#" className="hover:text-white transition cursor-hover">Terms of Service</a>
              <a href="#" className="hover:text-white transition cursor-hover">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
