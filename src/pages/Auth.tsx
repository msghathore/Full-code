import { useState } from 'react';
import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <CustomCursor />
      <Navigation />
      
      <div className="pt-32 pb-24 px-8">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-serif luxury-glow mb-4">
              WELCOME
            </h1>
            <p className="text-muted-foreground text-lg tracking-wider">
              Access your account
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-white/20">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-black">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-black">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="frosted-glass border border-white/10 rounded-lg p-8 mt-6">
              <form className="space-y-6">
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">EMAIL</label>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">PASSWORD</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>

                <button type="button" className="text-sm text-white/60 hover:text-white transition-colors">
                  Forgot password?
                </button>

                <Button 
                  type="submit" 
                  className="w-full bg-white text-black hover:bg-white/90 font-serif text-lg tracking-wider py-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="frosted-glass border border-white/10 rounded-lg p-8 mt-6">
              <form className="space-y-6">
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">FULL NAME</label>
                  <Input 
                    placeholder="Your name" 
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">EMAIL</label>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">PASSWORD</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-white text-black hover:bg-white/90 font-serif text-lg tracking-wider py-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
