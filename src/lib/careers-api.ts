import { supabase } from '@/integrations/supabase/client';
import { EmailService } from './email-service';

export interface JobOpening {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  type: string;
  location: string;
  salary_range?: string;
  is_active: boolean;
  created_at: string;
}

export interface JobApplication {
  id: string;
  job_opening_id: string;
  full_name: string;
  email: string;
  phone?: string;
  experience: string;
  cover_letter?: string;
  resume_url?: string;
  status: string;
  applied_at: string;
}

/**
 * Get all active job openings
 */
export async function getJobOpenings(): Promise<JobOpening[]> {
  try {
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching job openings:', error);
      // Fallback to hardcoded data if table doesn't exist yet
      return getFallbackJobOpenings();
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching job openings:', error);
    // Fallback to hardcoded data
    return getFallbackJobOpenings();
  }
}

/**
 * Submit a job application
 */
export async function submitJobApplication(
  applicationData: {
    jobOpeningId?: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    experience: string;
    coverLetter?: string;
    resume: File;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    // First, upload the resume to Supabase Storage
    const fileExt = applicationData.resume.name.split('.').pop();
    const fileName = `${Date.now()}-${applicationData.fullName.replace(/\s+/g, '_')}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, applicationData.resume);

    if (uploadError) {
      console.error('Error uploading resume:', uploadError);
      throw new Error('Failed to upload resume');
    }

    // Get the public URL for the uploaded resume
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // Find the job opening by title (since we don't have ID from the form)
    const { data: jobOpening } = await supabase
      .from('job_openings')
      .select('id')
      .eq('title', applicationData.position)
      .eq('is_active', true)
      .single();

    // Submit the application
    const { error } = await supabase
      .from('job_applications')
      .insert({
        job_opening_id: jobOpening?.id,
        full_name: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone,
        experience: applicationData.experience,
        cover_letter: applicationData.coverLetter,
        resume_url: publicUrl,
      });

    if (error) {
      console.error('Error submitting application:', error);
      throw error;
    }

    // Send email notification to salon owner
    try {
      const experienceLabels: Record<string, string> = {
        'entry': 'Entry Level (0-2 years)',
        'intermediate': 'Intermediate (2-5 years)',
        'experienced': 'Experienced (5-10 years)',
        'expert': 'Expert (10+ years)'
      };

      await EmailService.sendCustomEmail(
        'zairasalonspa@gmail.com',
        `📋 New Job Application: ${applicationData.position} - ${applicationData.fullName}`,
        {
          type: 'job_application',
          applicantName: applicationData.fullName,
          applicantEmail: applicationData.email,
          applicantPhone: applicationData.phone,
          position: applicationData.position,
          experience: experienceLabels[applicationData.experience] || applicationData.experience,
          coverLetter: applicationData.coverLetter || 'Not provided',
          resumeUrl: publicUrl,
          appliedAt: new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
          })
        }
      );
      console.log('✅ Job application email notification sent');
    } catch (emailError) {
      // Don't fail the application if email fails - just log it
      console.warn('⚠️ Failed to send email notification:', emailError);
    }

    return {
      success: true,
      message: 'Application submitted successfully! We\'ll be in touch with you shortly.'
    };

  } catch (error) {
    console.error('Error submitting job application:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
    };
  }
}

/**
 * Fallback job openings when Supabase table doesn't exist yet
 */
function getFallbackJobOpenings(): JobOpening[] {
  return [
    {
      id: '1',
      title: 'Senior Hair Stylist',
      description: 'Join our team of expert stylists in a luxury salon environment.',
      requirements: 'Licensed cosmetologist, 3+ years experience',
      type: 'Full-time',
      location: 'Downtown Salon',
      salary_range: '$45,000 - $65,000',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Licensed Massage Therapist',
      description: 'Provide therapeutic massage services in our state-of-the-art spa facility.',
      requirements: 'Licensed massage therapist, 2+ years experience',
      type: 'Full-time',
      location: 'Downtown Spa',
      salary_range: '$40,000 - $55,000',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Master Nail Technician',
      description: 'Create beautiful nail art and provide manicure/pedicure services.',
      requirements: 'Licensed nail technician, 2+ years experience',
      type: 'Full-time',
      location: 'Downtown Salon',
      salary_range: '$35,000 - $50,000',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Medical Esthetician',
      description: 'Perform advanced skincare treatments and consultations.',
      requirements: 'Licensed esthetician, medical background preferred',
      type: 'Full-time',
      location: 'Medical Spa',
      salary_range: '$50,000 - $70,000',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      title: 'Front Desk Coordinator',
      description: 'Manage appointments and provide exceptional customer service.',
      requirements: 'Customer service experience, computer skills',
      type: 'Part-time',
      location: 'Downtown Salon',
      salary_range: '$18 - $22/hour',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      title: 'Spa Coordinator',
      description: 'Coordinate spa services and manage client schedules.',
      requirements: 'Spa industry experience, organizational skills',
      type: 'Full-time',
      location: 'Downtown Spa',
      salary_range: '$35,000 - $45,000',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];
}