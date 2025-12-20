import { InstagramFeed } from '@/components/InstagramFeed';
import { UGCGallery } from '@/components/UGCGallery';
import { BeautyTips } from '@/components/BeautyTips';
import { CommunityForum } from '@/components/CommunityForum';
import { ReferralProgram } from '@/components/ReferralProgram';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Community = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="pt-20 pb-12 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-5xl md:text-7xl font-serif luxury-glow mb-6 animate-fade-in">
              COMMUNITY
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light tracking-wide">
              Join our beauty community - share your transformations, learn from experts, and connect with fellow beauty enthusiasts
            </p>
          </div>

          <Tabs defaultValue="instagram" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/5 border border-white/10 p-1 rounded-lg h-auto">
              <TabsTrigger
                value="instagram"
                className="data-[state=active]:bg-white data-[state=active]:text-black text-white/70 py-3 transition-all duration-300 font-medium tracking-wide"
              >
                Instagram
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="data-[state=active]:bg-white data-[state=active]:text-black text-white/70 py-3 transition-all duration-300 font-medium tracking-wide"
              >
                Gallery
              </TabsTrigger>
              <TabsTrigger
                value="tips"
                className="data-[state=active]:bg-white data-[state=active]:text-black text-white/70 py-3 transition-all duration-300 font-medium tracking-wide"
              >
                Beauty Tips
              </TabsTrigger>
              <TabsTrigger
                value="forum"
                className="data-[state=active]:bg-white data-[state=active]:text-black text-white/70 py-3 transition-all duration-300 font-medium tracking-wide"
              >
                Forum
              </TabsTrigger>
              <TabsTrigger
                value="referrals"
                className="data-[state=active]:bg-white data-[state=active]:text-black text-white/70 py-3 transition-all duration-300 font-medium tracking-wide"
              >
                Referrals
              </TabsTrigger>
            </TabsList>

            <div className="mt-8 md:mt-12 min-h-[50vh]">
              <TabsContent value="instagram" className="animate-fade-in">
                <InstagramFeed />
              </TabsContent>

              <TabsContent value="gallery" className="animate-fade-in">
                <UGCGallery />
              </TabsContent>

              <TabsContent value="tips" className="animate-fade-in">
                <BeautyTips />
              </TabsContent>

              <TabsContent value="forum" className="animate-fade-in">
                <CommunityForum />
              </TabsContent>

              <TabsContent value="referrals" className="animate-fade-in">
                <ReferralProgram />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Community;