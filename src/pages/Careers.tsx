import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/hooks/use-language';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollIndicator } from '@/components/ScrollIndicator';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, DollarSign, GraduationCap, Award, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Careers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    coverLetter: '',
    resume: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Luxury animations
    gsap.fromTo('.careers-hero',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }
    );

    gsap.fromTo('.careers-content',
      { opacity: 0, y: 80 },
      {
        opacity: 1, y: 0, duration: 1.2, delay: 0.3, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.careers-content',
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    gsap.fromTo('.careers-form',
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1, scale: 1, duration: 1, delay: 0.6, ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.careers-form',
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, []);

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('resume', file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.resume) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume to apply.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll be in touch with you shortly.",
      });
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="pt-32 pb-24 px-4 md:px-8">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="frosted-glass border border-white/10 rounded-2xl p-12 md:p-16">
                <h1 className="text-4xl md:text-5xl font-serif luxury-glow mb-6">
                  Thank You for Applying!
                </h1>
                <p className="text-xl text-white/80 mb-8">
                  Your application has been successfully submitted. We'll review your resume and be in touch with you shortly.
                </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    position: '',
                    experience: '',
                    coverLetter: '',
                    resume: null
                  });
                }}
                className="bg-white text-black hover:bg-gray-200"
              >
                Apply for Another Position
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navigation />

      {/* Hero Section */}
      <div className="careers-hero relative pt-32 pb-24 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif luxury-glow mb-6 animate-glow-pulse">
            JOIN OUR TEAM
          </h1>
        </div>
      </div>
      <ScrollIndicator />

      {/* Content Section */}
      <div className="careers-content py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 mb-8">
            {/* Why Work With Us */}
            <div className="frosted-glass border border-white/10 rounded-2xl p-8 md:p-12 hover:border-white/30 transition-all duration-500">
              <h2 className="text-3xl md:text-4xl font-serif luxury-glow mb-8">Why Choose Zavira?</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Competitive Compensation</h3>
                    <p className="text-white/70">Industry-leading salaries with performance bonuses and gratuities</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Professional Development</h3>
                    <p className="text-white/70">Ongoing training with industry leaders and certification programs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Luxury Environment</h3>
                    <p className="text-white/70">Work in a state-of-the-art facility with premium equipment and products</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Work-Life Balance</h3>
                    <p className="text-white/70">Flexible scheduling and comprehensive benefits package</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Openings */}
            <div className="frosted-glass border border-white/10 rounded-2xl p-8 md:p-12 hover:border-white/30 transition-all duration-500">
              <h2 className="text-3xl md:text-4xl font-serif luxury-glow mb-8">Current Opportunities</h2>
              <div className="space-y-4">
                {[
                  { title: 'Senior Hair Stylist', type: 'Full-time' },
                  { title: 'Licensed Massage Therapist', type: 'Full-time' },
                  { title: 'Master Nail Technician', type: 'Full-time' },
                  { title: 'Medical Esthetician', type: 'Full-time' },
                  { title: 'Front Desk Coordinator', type: 'Part-time' },
                  { title: 'Spa Coordinator', type: 'Full-time' }
                ].map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <h3 className="text-lg font-semibold">{position.title}</h3>
                      <p className="text-white/60 text-sm">{position.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-green-400">Open</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="careers-form frosted-glass border border-white/10 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif luxury-glow mb-4">Apply Now</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">FULL NAME</label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Your full name"
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30 h-12"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">EMAIL ADDRESS</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30 h-12"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">PHONE NUMBER</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30 h-12"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">POSITION APPLYING FOR</label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)} required>
                    <SelectTrigger className="bg-black/50 border-white/20 text-white h-12">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/20">
                      <SelectItem value="senior-hairstylist" className="text-white">Senior Hair Stylist</SelectItem>
                      <SelectItem value="massage-therapist" className="text-white">Licensed Massage Therapist</SelectItem>
                      <SelectItem value="nail-technician" className="text-white">Master Nail Technician</SelectItem>
                      <SelectItem value="esthetician" className="text-white">Medical Esthetician</SelectItem>
                      <SelectItem value="front-desk" className="text-white">Front Desk Coordinator</SelectItem>
                      <SelectItem value="spa-coordinator" className="text-white">Spa Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">YEARS OF EXPERIENCE</label>
                <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)} required>
                  <SelectTrigger className="bg-black/50 border-white/20 text-white h-12">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="entry" className="text-white">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="intermediate" className="text-white">Intermediate (2-5 years)</SelectItem>
                    <SelectItem value="experienced" className="text-white">Experienced (5-10 years)</SelectItem>
                    <SelectItem value="expert" className="text-white">Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">COVER LETTER</label>
                <Textarea
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  placeholder="Tell us why you're interested in joining Zavira..."
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30 min-h-[120px]"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">RESUME / CV</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div key={formData.resume?.name || 'no-file'} className="bg-black/50 border border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-white/60" />
                    <p className="text-white/80 mb-2">
                      {formData.resume ? `${formData.resume.name} (${(formData.resume.size / 1024 / 1024).toFixed(1)}MB)` : 'Click to upload your resume'}
                    </p>
                    <p className="text-white/60 text-sm">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-8">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-black hover:bg-gray-200 px-12 py-4 text-lg font-serif tracking-wider"
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}