import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useLocation } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollIndicator } from '@/components/ScrollIndicator';
import { useToast } from '@/hooks/use-toast';
import { Upload, DollarSign, GraduationCap, Award, Zap } from 'lucide-react';
import { submitJobApplication } from '@/lib/careers-api';

export default function Careers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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
  const formRef = useRef<HTMLDivElement>(null);

  // Scroll to hash section on load
  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // If hash is 'apply', show the form
          if (hash === 'apply') {
            setShowForm(true);
          }
        }
      }, 300);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  const handleApplyClick = (jobTitle: string) => {
    setSelectedJob(jobTitle);
    setFormData(prev => ({ ...prev, position: jobTitle }));
    setShowForm(true);

    // Wait for form to render, then scroll it into view
    setTimeout(() => {
      // Try using the ref first, fallback to finding the form by heading
      let formElement = formRef.current;
      if (!formElement) {
        const heading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Apply for:'));
        formElement = heading?.closest('.frosted-glass') as HTMLDivElement | null;
      }

      if (formElement) {
        const formTop = formElement.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, formTop), behavior: 'smooth' });
      }
    }, 150);
  };

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      // File size validation (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Resume must be less than 10MB. Please upload a smaller file.",
          variant: "destructive",
        });
        e.target.value = ''; // Reset input
        return;
      }

      // File type validation
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, DOC, DOCX, or TXT file.",
          variant: "destructive",
        });
        e.target.value = ''; // Reset input
        return;
      }
    }

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

    try {
      const result = await submitJobApplication({
        jobOpeningId: undefined, // Will be found by position title
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        experience: formData.experience,
        coverLetter: formData.coverLetter,
        resume: formData.resume
      });

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: "Application Submitted Successfully!",
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error Submitting Application",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pt-20 pb-12 px-4 md:px-8">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="frosted-glass border border-white/10 rounded-2xl p-8 md:p-16">
              <h1 className="text-3xl md:text-5xl font-serif luxury-glow mb-6">
                Thank You for Applying!
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">
                Your application has been successfully submitted. We'll review your resume and be in touch with you shortly.
              </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setSelectedJob(null);
                  setShowForm(false);
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
                className="bg-white text-black hover:bg-gray-200 w-full md:w-auto"
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

      {/* Page Title - CAREERS */}
      <div className="careers-title pt-24 pb-3 px-4 md:px-8 text-center">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-[0.4em] uppercase luxury-glow animate-glow-pulse text-hover-shimmer"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.4em',
            color: '#ffffff',
            opacity: 1,
            textShadow: '0 0 15px #fff, 0 0 30px #fff, 0 0 45px #fff, 0 0 60px rgba(255,255,255,0.9), 0 0 90px rgba(255,255,255,0.7), 0 0 120px rgba(255,255,255,0.5)'
          }}
        >
          CAREERS
        </h1>
      </div>
      <ScrollIndicator />

      {/* Content Section */}
      <div className="careers-content py-0 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-3 md:gap-5 mb-2">
            {/* Why Choose Zavira */}
            <div className="frosted-glass border border-white/10 rounded-2xl p-3 md:p-5 hover:border-white/30 transition-all duration-500">
              <h2 className="text-xl md:text-2xl font-serif luxury-glow mb-2">Why Choose Zavira?</h2>
              <div className="space-y-1.5">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold mb-0.5">Competitive Compensation</h3>
                    <p className="text-white/70 text-xs">Industry-leading pay with performance bonuses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold mb-0.5">Professional Development</h3>
                    <p className="text-white/70 text-xs">Ongoing training and certification programs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold mb-0.5">Luxury Environment</h3>
                    <p className="text-white/70 text-xs">State-of-the-art facility with premium equipment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold mb-0.5">Work-Life Balance</h3>
                    <p className="text-white/70 text-xs">Flexible scheduling and benefits package</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Opportunities */}
            <div id="openings" className="frosted-glass border border-white/10 rounded-2xl p-3 md:p-5 hover:border-white/30 transition-all duration-500 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-serif luxury-glow mb-2">Current Opportunities</h2>
              <div className="space-y-1.5">
                {[
                  'Nail Tech',
                  'Tattoo Artist',
                  'Massage Therapist',
                  'Esthetician',
                  'Medical Esthetician',
                  'Hairstylist'
                ].map((position) => (
                  <div key={position} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div>
                      <h3 className="text-xs md:text-sm font-semibold">{position}</h3>
                      <p className="text-white/60 text-[10px]">Part/Full Time</p>
                    </div>
                    <Button
                      onClick={() => handleApplyClick(position)}
                      className="bg-green-400 hover:bg-green-500 text-black font-semibold px-2.5 py-1 text-xs rounded-md transition-colors"
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Application Form */}
          {showForm && (
            <div
              id="apply"
              ref={formRef}
              className="frosted-glass border border-white/10 rounded-2xl p-3 md:p-5 max-w-4xl mx-auto mt-3 animate-fade-in scroll-mt-24"
            >
              <div className="text-center mb-2 md:mb-3">
                <h2 className="text-2xl md:text-3xl font-serif luxury-glow mb-1">
                  Apply for: {selectedJob}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/70 mb-1 block tracking-wider">FULL NAME</label>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Your full name"
                      className="bg-black/50 border-white/20 text-white placeholder:text-white/30 h-10 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/70 mb-1 block tracking-wider">EMAIL ADDRESS</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className="bg-black/50 border-white/20 text-white placeholder:text-white/30 h-10 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/70 mb-1 block tracking-wider">PHONE NUMBER</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="bg-black/50 border-white/20 text-white placeholder:text-white/30 h-10 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/70 mb-1 block tracking-wider">POSITION APPLYING FOR</label>
                    <Input
                      type="text"
                      value={formData.position}
                      readOnly
                      className="bg-black/30 border-white/20 text-white h-10 rounded-lg cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/70 mb-1 block tracking-wider">YEARS OF EXPERIENCE</label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)} required>
                    <SelectTrigger className="bg-black/50 border-white/20 text-white h-10 rounded-lg">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/20 rounded-lg">
                      <SelectItem value="entry" className="text-white">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="intermediate" className="text-white">Intermediate (2-5 years)</SelectItem>
                      <SelectItem value="experienced" className="text-white">Experienced (5-10 years)</SelectItem>
                      <SelectItem value="expert" className="text-white">Expert (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-white/70 mb-1 block tracking-wider">COVER LETTER <span className="text-white/40">(Optional)</span></label>
                  <Textarea
                    value={formData.coverLetter}
                    onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                    placeholder="Tell us why you're interested in joining Zavira..."
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30 min-h-[80px] rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 mb-1 block tracking-wider">RESUME / CV</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div key={formData.resume?.name || 'no-file'} className="bg-black/50 border border-white/20 rounded-lg p-4 text-center hover:border-white/40 transition-colors">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-white/60" />
                      <p className="text-white/80 text-sm mb-1">
                        {formData.resume ? `${formData.resume.name} (${(formData.resume.size / 1024 / 1024).toFixed(1)}MB)` : 'Click to upload your resume'}
                      </p>
                      <p className="text-white/60 text-xs">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white text-black hover:bg-gray-200 px-6 md:px-10 py-2.5 text-sm md:text-base font-serif tracking-wider w-full md:w-auto rounded-lg"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}