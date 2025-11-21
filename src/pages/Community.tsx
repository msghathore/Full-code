import { InstagramFeed } from '@/components/InstagramFeed';
import { UGCGallery } from '@/components/UGCGallery';
import { BeautyTips } from '@/components/BeautyTips';
import { CommunityForum } from '@/components/CommunityForum';
import { ReferralProgram } from '@/components/ReferralProgram';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Community = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-serif text-white mb-4 animate-fade-in">
            Community
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join our beauty community - share your transformations, learn from experts, and connect with fellow beauty enthusiasts
          </p>
        </div>

        <Tabs defaultValue="instagram" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-black/50 border border-white/10">
            <TabsTrigger value="instagram" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
              Instagram
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
              Gallery
            </TabsTrigger>
            <TabsTrigger value="tips" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
              Beauty Tips
            </TabsTrigger>
            <TabsTrigger value="forum" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
              Forum
            </TabsTrigger>
            <TabsTrigger value="referrals" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
              Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instagram" className="mt-8">
            <InstagramFeed />
          </TabsContent>

          <TabsContent value="gallery" className="mt-8">
            <UGCGallery />
          </TabsContent>

          <TabsContent value="tips" className="mt-8">
            <BeautyTips />
          </TabsContent>

          <TabsContent value="forum" className="mt-8">
            <CommunityForum />
          </TabsContent>

          <TabsContent value="referrals" className="mt-8">
            <ReferralProgram />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;