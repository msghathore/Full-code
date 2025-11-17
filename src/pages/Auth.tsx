import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <CustomCursor />
      <Navigation />
      
      <div className="pt-32 pb-24 px-4 md:px-8">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow mb-4">
              {isLogin ? 'LOGIN' : 'SIGN UP'}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg tracking-wider">
              {isLogin ? 'Access your account' : 'Create your account'}
            </p>
          </div>

          <div className="frosted-glass border border-white/10 rounded-lg p-6 md:p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">FULL NAME</label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">EMAIL</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">PASSWORD</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-white/90 font-serif text-lg tracking-wider py-6"
              >
                {loading ? 'LOADING...' : isLogin ? 'LOGIN' : 'SIGN UP'}
              </Button>

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-center text-white/70 hover:text-white transition-colors text-sm tracking-wider"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
