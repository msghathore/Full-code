import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-9xl font-serif luxury-glow">404</h1>
          <p className="mb-8 text-2xl text-muted-foreground tracking-wider">Page not found</p>
          <Link to="/" className="inline-block px-8 py-4 border border-white/20 rounded-full hover:border-white/40 hover:bg-white/5 transition-all cursor-hover luxury-glow">
            Return to Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
