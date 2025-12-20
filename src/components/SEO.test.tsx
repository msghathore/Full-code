import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './SEO';

const renderWithHelmet = (component: React.ReactElement) => {
  return render(
    <HelmetProvider>
      {component}
    </HelmetProvider>
  );
};

describe('SEO Component', () => {
  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = '';
  });

  it('renders basic meta tags', () => {
    renderWithHelmet(<SEO />);

    // Check if title is set
    expect(document.title).toContain('Zavira Beauty Salon');

    // Check for basic meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toBeInTheDocument();
    expect(metaDescription?.getAttribute('content')).toContain('Luxury beauty salon');
  });

  it('renders custom title and description', () => {
    const customTitle = 'Custom Page Title';
    const customDescription = 'Custom page description';

    renderWithHelmet(
      <SEO
        title={customTitle}
        description={customDescription}
      />
    );

    expect(document.title).toBe(`${customTitle} | Zavira Beauty Salon`);

    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription?.getAttribute('content')).toBe(customDescription);
  });

  it('renders Open Graph tags', () => {
    renderWithHelmet(<SEO />);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogType = document.querySelector('meta[property="og:type"]');

    expect(ogTitle).toBeInTheDocument();
    expect(ogDescription).toBeInTheDocument();
    expect(ogType?.getAttribute('content')).toBe('website');
  });

  it('renders Twitter Card tags', () => {
    renderWithHelmet(<SEO />);

    const twitterCard = document.querySelector('meta[property="twitter:card"]');
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');

    expect(twitterCard).toBeInTheDocument();
    expect(twitterTitle).toBeInTheDocument();
    expect(twitterDescription).toBeInTheDocument();
  });

  it('renders structured data', () => {
    renderWithHelmet(<SEO />);

    const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    expect(structuredDataScript).toBeInTheDocument();

    const structuredData = JSON.parse(structuredDataScript?.textContent || '{}');
    expect(structuredData['@type']).toBe('BeautySalon');
    expect(structuredData.name).toBe('Zavira Beauty Salon');
  });

  it('handles article type correctly', () => {
    const articleData = {
      publishedTime: '2024-01-01T00:00:00.000Z',
      author: 'Test Author',
      section: 'Beauty Tips',
    };

    renderWithHelmet(
      <SEO
        type="article"
        {...articleData}
      />
    );

    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType?.getAttribute('content')).toBe('article');

    const articleAuthor = document.querySelector('meta[property="article:author"]');
    expect(articleAuthor?.getAttribute('content')).toBe(articleData.author);

    const articleSection = document.querySelector('meta[property="article:section"]');
    expect(articleSection?.getAttribute('content')).toBe(articleData.section);
  });

  it('respects noindex directive', () => {
    renderWithHelmet(<SEO noindex />);

    const robotsMeta = document.querySelector('meta[name="robots"]');
    expect(robotsMeta?.getAttribute('content')).toBe('noindex,nofollow');
  });
});