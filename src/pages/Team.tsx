import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

/**
 * Team Page - Black Background with White Glowing Text Only
 *
 * Colors:
 * - Zavira Black: #0a0a0a (primary background)
 * - Zavira White: #FAFAFA (text with glow effects)
 *
 * Typography:
 * - Playfair Display: headlines, light (300), letter-spacing 0.02em
 * - Inter: body text, regular (400)
 *
 * Effects:
 * - Glow pulse: 2s ease-in-out infinite (white glow)
 * - Card lift: -8px on hover, 300ms
 * - Border glow: white
 */

// Staff member interface
interface StaffMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  role: string | null;
  specialty: string | null;
  bio: string | null;
  avatar: string | null;
  team_image_url: string | null;
  status: string | null;
  team_display_order: number | null;
}

// Placeholder images from Unsplash/Pexels
const placeholderImages = [
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=faces',
];

// Animation variants per brand guidelines
// Luxury transition: duration 0.6, ease [0.22, 1, 0.36, 1]
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Luxury ease from brand guidelines
    },
  },
};

// Card hover variants per brand guidelines
// Card hover: -8px lift, 300ms, cubic-bezier(0.4, 0, 0.2, 1)
const cardVariants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Format role for display
const formatRole = (role: string | null): string => {
  if (!role) return 'Team Member';
  const roleMap: Record<string, string> = {
    'admin': 'Lead Stylist & Manager',
    'senior': 'Senior Specialist',
    'junior': 'Specialist',
    'manager': 'Manager',
  };
  return roleMap[role.toLowerCase()] || role.charAt(0).toUpperCase() + role.slice(1);
};

// Team member card component
const TeamMemberCard = ({ member, index }: { member: StaffMember; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const displayName = member.first_name && member.last_name
    ? `${member.first_name} ${member.last_name}`
    : member.name || 'Team Member';

  const imageUrl = member.team_image_url || member.avatar || placeholderImages[index % placeholderImages.length];
  const bio = member.bio || 'Dedicated to providing exceptional service and creating beautiful experiences for every client.';

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      <motion.div
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
        className="relative overflow-hidden group"
        style={{
          background: 'rgba(255, 255, 255, 0.05)', // Card background per guidelines
          borderRadius: '12px', // radius-lg from guidelines
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Image container */}
        <div className="relative h-80 overflow-hidden" style={{ borderRadius: '12px 12px 0 0' }}>
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderImages[index % placeholderImages.length];
            }}
          />
          {/* Dark overlay gradient per brand guidelines */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
            }}
          />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Name with luxury glow per brand guidelines */}
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400, // Regular from guidelines
              fontSize: '1.5rem',
              letterSpacing: '0.01em',
              color: '#FAFAFA', // Zavira White
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)', // Luxury glow
              marginBottom: '4px',
            }}
          >
            {displayName}
          </h3>

          {/* Role with white glow */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500, // Medium
              fontSize: '0.875rem',
              letterSpacing: '0.02em',
              color: '#FAFAFA', // White
              textShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
              marginBottom: '8px',
            }}
          >
            {formatRole(member.role)}
          </p>

          {/* Specialty */}
          {member.specialty && (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(250, 250, 250, 0.6)', // Muted white
                marginBottom: '12px',
              }}
            >
              {member.specialty}
            </p>
          )}

          {/* Bio - visible on hover per guidelines */}
          <p
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '0.875rem',
              lineHeight: 1.6, // 1.5-1.7 per guidelines
              color: 'rgba(250, 250, 250, 0.8)',
            }}
          >
            {bio}
          </p>
        </div>

        {/* Hover border glow - white */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.3)', // White border on hover
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)', // White glow
          }}
        />
      </motion.div>
    </motion.div>
  );
};

// Loading skeleton per brand guidelines
const TeamCardSkeleton = () => (
  <div
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}
  >
    {/* Skeleton shimmer animation per guidelines */}
    <div
      className="h-80 w-full animate-pulse"
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
        backgroundSize: '200% 100%',
      }}
    />
    <div className="p-6 space-y-3">
      <div className="h-6 w-32 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <div className="h-3 w-40 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
    </div>
  </div>
);

const Team = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team members from Supabase
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use only columns that exist in the database
        const { data, error: fetchError } = await supabase
          .from('staff')
          .select('id, first_name, last_name, name, role, specialty, avatar, status')
          .neq('status', 'offline')
          .order('first_name', { ascending: true });

        if (fetchError) {
          console.error('Error fetching staff:', fetchError);
          throw fetchError;
        }

        // Map data with null values for optional fields
        setTeamMembers((data || []).map(s => ({
          ...s,
          bio: null,
          team_image_url: null,
          team_display_order: null,
        })));
      } catch (err) {
        console.error('Error loading team:', err);
        setError('Unable to load team members');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#0a0a0a', // Zavira Black - primary background
      }}
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center" ref={headerRef}>
          {/* Main heading with glow pulse animation per brand guidelines */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="animate-glow-pulse"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300, // Light per guidelines
              fontSize: 'clamp(3rem, 8vw, 8rem)', // H1 Hero: 72-128px
              letterSpacing: '0.02em',
              color: '#FAFAFA', // Zavira White
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.2)',
              marginBottom: '24px',
            }}
          >
            Our Team
          </motion.h1>

          {/* Subheading per brand guidelines */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300, // Light
              fontSize: 'clamp(1rem, 2vw, 1.25rem)', // Body Large: 18-20px
              lineHeight: 1.7, // Per guidelines
              color: 'rgba(250, 250, 250, 0.7)',
              maxWidth: '42rem',
              margin: '0 auto',
            }}
          >
            Meet the talented artists and specialists who bring your beauty vision to life
          </motion.p>

          {/* Decorative line - white glow */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isHeaderInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '96px',
              height: '1px',
              margin: '32px auto 0',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            }}
          />
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <p style={{
              fontFamily: "'Inter', sans-serif",
              color: 'rgba(250, 250, 250, 0.6)',
            }}>
              {error}
            </p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <p style={{
              fontFamily: "'Inter', sans-serif",
              color: 'rgba(250, 250, 250, 0.6)',
            }}>
              Our team information is being updated. Check back soon!
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={member.id} member={member} index={index} />
            ))}
          </motion.div>
        )}
      </section>

      {/* Join Our Team CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 300,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', // H2 Section: 48-56px
              letterSpacing: '0.02em',
              color: '#FAFAFA',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)',
              marginBottom: '24px',
            }}
          >
            Join Our Team
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: '1.125rem',
              lineHeight: 1.7,
              color: 'rgba(250, 250, 250, 0.7)',
              marginBottom: '40px',
            }}
          >
            Are you passionate about beauty and excellence? We're always looking for talented individuals to join our family.
          </motion.p>

          {/* Primary Button - white glass style */}
          <motion.a
            href="/careers"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)',
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-block',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '1rem',
              letterSpacing: '0.02em',
              padding: '16px 40px',
              borderRadius: '9999px',
              color: '#0a0a0a', // Black text on white button
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.3), 0 4px 15px rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            View Open Positions
          </motion.a>
        </div>
      </section>

      <Footer />

      {/* CSS for glow pulse animation - 2s ease-in-out per brand guidelines */}
      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            text-shadow:
              0 0 10px rgba(255, 255, 255, 0.5),
              0 0 20px rgba(255, 255, 255, 0.3);
          }
          50% {
            text-shadow:
              0 0 20px rgba(255, 255, 255, 0.8),
              0 0 40px rgba(255, 255, 255, 0.5),
              0 0 60px rgba(255, 255, 255, 0.3);
          }
        }

        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Team;
