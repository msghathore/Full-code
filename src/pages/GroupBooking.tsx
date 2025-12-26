import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupBookings, useGroupPackages } from '@/hooks/useGroupBookings';
import {
  GroupType,
  GROUP_TYPE_LABELS,
  GROUP_TYPE_ICONS,
  CreateGroupBookingInput,
} from '@/types/groupBooking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, parseISO } from 'date-fns';
import {
  Users,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Heart,
  Briefcase,
  Gift,
  Smile,
  Star,
  Plus,
  Trash2,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Step components
const STEPS = [
  { id: 1, name: 'Group Type', description: 'Choose your occasion' },
  { id: 2, name: 'Details', description: 'Group information' },
  { id: 3, name: 'Members', description: 'Add your group' },
  { id: 4, name: 'Schedule', description: 'Pick date & time' },
  { id: 5, name: 'Review', description: 'Confirm booking' },
];

// Maximum number of members allowed in a group booking (including lead)
const MAX_GROUP_MEMBERS = 20;

const GROUP_TYPE_OPTIONS = [
  { type: 'bridal' as GroupType, icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-300', description: 'Perfect for brides and their party' },
  { type: 'birthday' as GroupType, icon: Gift, color: 'bg-white/10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-white/30', description: 'Celebrate your special day' },
  { type: 'corporate' as GroupType, icon: Briefcase, color: 'bg-slate-50 text-slate-700 border-slate-300', description: 'Team building and corporate events' },
  { type: 'spa_day' as GroupType, icon: Sparkles, color: 'bg-teal-100 text-teal-700 border-teal-300', description: 'Relaxing spa experience' },
  { type: 'friends' as GroupType, icon: Smile, color: 'bg-white/10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-white/30', description: 'Fun day out with friends' },
  { type: 'custom' as GroupType, icon: Star, color: 'bg-gray-100 text-gray-700 border-gray-300', description: 'Create your own experience' },
];

interface MemberInput {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceIds: string[];
}

export default function GroupBooking() {
  const navigate = useNavigate();
  const { createGroupBooking, addGroupMember } = useGroupBookings();
  const { packages, pricingTiers, getDiscountForSize } = useGroupPackages();

  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [groupType, setGroupType] = useState<GroupType | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [leadInfo, setLeadInfo] = useState({
    name: '',
    email: '',
    phone: '',
    serviceIds: [] as string[],
  });
  const [members, setMembers] = useState<MemberInput[]>([]);
  const [bookingDate, setBookingDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('10:00');
  const [schedulingType, setSchedulingType] = useState('parallel');
  const [specialRequests, setSpecialRequests] = useState('');

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from('services')
        .select('id, name, price, duration_minutes, category')
        .eq('is_active', true)
        .order('category', { ascending: true });
      setServices(data || []);
    };
    fetchServices();
  }, []);

  // Generate time slots
  useEffect(() => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    setAvailableSlots(slots);
  }, [bookingDate]);

  // Calculate totals
  const totalMembers = members.length + 1; // +1 for lead
  const discount = getDiscountForSize(totalMembers);

  // Lead's services total
  const leadSubtotal = leadInfo.serviceIds.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return sum + (service?.price || 0);
  }, 0);

  // Members' services total
  const membersSubtotal = members.reduce((sum, m) => {
    const memberTotal = m.serviceIds.reduce((serviceSum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return serviceSum + (service?.price || 0);
    }, 0);
    return sum + memberTotal;
  }, 0);

  const subtotal = leadSubtotal + membersSubtotal;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;
  const depositRequired = total * 0.5;

  // Toggle service for lead (multi-select)
  const toggleLeadService = (serviceId: string) => {
    const hasService = leadInfo.serviceIds.includes(serviceId);
    setLeadInfo({
      ...leadInfo,
      serviceIds: hasService
        ? leadInfo.serviceIds.filter(id => id !== serviceId)
        : [...leadInfo.serviceIds, serviceId],
    });
  };

  // Add member (with limit check)
  const addMember = () => {
    // Check if we've reached the maximum member limit (totalMembers includes lead + members)
    if (totalMembers >= MAX_GROUP_MEMBERS) {
      toast.error(`Maximum group size is ${MAX_GROUP_MEMBERS} people`);
      return;
    }
    setMembers([
      ...members,
      {
        id: crypto.randomUUID(),
        name: '',
        email: '',
        phone: '',
        serviceIds: [],
      },
    ]);
  };

  // Check if at member limit
  const isAtMemberLimit = totalMembers >= MAX_GROUP_MEMBERS;

  // Remove member
  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  // Update member
  const updateMember = (id: string, field: keyof MemberInput, value: string | string[]) => {
    setMembers(members.map(m => (m.id === id ? { ...m, [field]: value } : m)));
  };

  // Toggle service for member (multi-select)
  const toggleMemberService = (memberId: string, serviceId: string) => {
    setMembers(members.map(m => {
      if (m.id !== memberId) return m;
      const hasService = m.serviceIds.includes(serviceId);
      return {
        ...m,
        serviceIds: hasService
          ? m.serviceIds.filter(id => id !== serviceId)
          : [...m.serviceIds, serviceId],
      };
    }));
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!groupType || !leadInfo.name || !leadInfo.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create group booking
      const booking = await createGroupBooking({
        group_name: groupName || `${leadInfo.name}'s ${GROUP_TYPE_LABELS[groupType]}`,
        group_type: groupType,
        package_id: selectedPackage || undefined,
        lead_name: leadInfo.name,
        lead_email: leadInfo.email,
        lead_phone: leadInfo.phone,
        total_members: totalMembers,
        booking_date: bookingDate,
        start_time: startTime,
        scheduling_type: schedulingType as any,
        special_requests: specialRequests,
      });

      if (!booking) {
        throw new Error('Failed to create booking');
      }

      // Add additional members (create one entry per service for each member)
      for (const member of members) {
        if (member.name) {
          // If member has multiple services, add them for each service
          if (member.serviceIds.length > 0) {
            for (const serviceId of member.serviceIds) {
              await addGroupMember({
                group_booking_id: booking.id,
                member_name: member.name,
                member_email: member.email,
                member_phone: member.phone,
                service_id: serviceId,
              });
            }
          } else {
            // No services selected, just add the member
            await addGroupMember({
              group_booking_id: booking.id,
              member_name: member.name,
              member_email: member.email,
              member_phone: member.phone,
            });
          }
        }
      }

      toast.success('Group booking created successfully!');
      navigate(`/group-booking/confirmation/${booking.share_code}`);
    } catch (err: any) {
      toast.error(`Failed to create booking: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step validation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return groupType !== null;
      case 2:
        return leadInfo.name && leadInfo.email;
      case 3:
        return true; // Members are optional
      case 4:
        return bookingDate && startTime;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Group Booking</h1>
          <p className="text-gray-600 mt-1">Plan your perfect group experience</p>
        </div>
      </div>

      {/* Progress */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center',
                index < STEPS.length - 1 && 'flex-1'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all',
                  currentStep === step.id
                    ? 'bg-black border-black text-white'
                    : currentStep > step.id
                    ? 'bg-black/80 border-black/80 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                )}
              >
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 rounded',
                    currentStep > step.id ? 'bg-black/80' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {STEPS.map(step => (
            <div
              key={step.id}
              className={cn(
                'text-center',
                currentStep === step.id ? 'text-black font-medium' : 'text-gray-500'
              )}
              style={{ width: `${100 / STEPS.length}%` }}
            >
              <p className="text-xs font-medium hidden sm:block">{step.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-24">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Group Type Selection */}
            {currentStep === 1 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {GROUP_TYPE_OPTIONS.map(option => {
                  const Icon = option.icon;
                  const isSelected = groupType === option.type;
                  return (
                    <button
                      key={option.type}
                      onClick={() => setGroupType(option.type)}
                      className={cn(
                        'p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg',
                        isSelected
                          ? `${option.color} border-current shadow-md scale-105`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <Icon className={cn('w-8 h-8 mb-3', isSelected ? '' : 'text-gray-400')} />
                      <h3 className="font-semibold mb-1">
                        {GROUP_TYPE_ICONS[option.type]} {GROUP_TYPE_LABELS[option.type]}
                      </h3>
                      <p className={cn('text-sm', isSelected ? '' : 'text-gray-500')}>
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Group Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Group Name (Optional)</Label>
                  <Input
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder={`e.g., ${leadInfo.name || 'Sarah'}'s ${groupType ? GROUP_TYPE_LABELS[groupType] : 'Party'}`}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Lead Organizer (You)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={leadInfo.name}
                        onChange={e => setLeadInfo({ ...leadInfo, name: e.target.value })}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={leadInfo.email}
                        onChange={e => setLeadInfo({ ...leadInfo, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={leadInfo.phone}
                        onChange={e => setLeadInfo({ ...leadInfo, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-900 font-medium">Your Services (Select Multiple)</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-800 rounded-lg p-3 bg-black/95">
                        {Object.entries(
                          services.reduce((acc, service) => {
                            const cat = service.category || 'Other';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(service);
                            return acc;
                          }, {} as Record<string, typeof services>)
                        ).map(([category, categoryServices]) => (
                          <div key={category} className="space-y-1">
                            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{category}</p>
                            {categoryServices.map(service => (
                              <label
                                key={service.id}
                                className={cn(
                                  'flex items-center gap-2 p-2 rounded cursor-pointer transition-all text-sm',
                                  leadInfo.serviceIds.includes(service.id)
                                    ? 'bg-white text-black border border-white'
                                    : 'bg-black/50 text-white border border-white/20 hover:border-white/50'
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={leadInfo.serviceIds.includes(service.id)}
                                  onChange={() => toggleLeadService(service.id)}
                                  className="w-4 h-4 rounded border-white/30 bg-transparent checked:bg-black checked:border-black focus:ring-white"
                                />
                                <span className="flex-1 truncate">{service.name}</span>
                                <span className={cn(
                                  'font-medium',
                                  leadInfo.serviceIds.includes(service.id) ? 'text-black' : 'text-white/70'
                                )}>${service.price}</span>
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                      {leadInfo.serviceIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {leadInfo.serviceIds.map(serviceId => {
                            const service = services.find(s => s.id === serviceId);
                            return service ? (
                              <Badge key={serviceId} className="text-xs bg-black text-white border border-black">
                                {service.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Package selection if available */}
                {packages.filter(p => !groupType || p.group_type === groupType).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-4">Select a Package (Optional)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packages
                          .filter(p => !groupType || p.group_type === groupType || p.group_type === null)
                          .map(pkg => (
                            <button
                              key={pkg.id}
                              onClick={() => setSelectedPackage(selectedPackage === pkg.id ? null : pkg.id)}
                              className={cn(
                                'p-4 rounded-lg border-2 text-left transition-all',
                                selectedPackage === pkg.id
                                  ? 'border-pink-500 bg-pink-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              )}
                            >
                              <h4 className="font-semibold">{pkg.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">
                                  ${pkg.per_person_price}/person
                                </Badge>
                                <Badge variant="outline">
                                  {pkg.min_members}-{pkg.max_members} people
                                </Badge>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Members */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Group Members</h3>
                    <p className="text-sm text-gray-500">
                      Add members now or share a link later for them to join
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {totalMembers} / {MAX_GROUP_MEMBERS} members
                    </p>
                  </div>
                  <Button
                    onClick={addMember}
                    variant="outline"
                    size="sm"
                    disabled={isAtMemberLimit}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAtMemberLimit ? 'Limit Reached' : 'Add Member'}
                  </Button>
                </div>

                {/* Member limit warning */}
                {isAtMemberLimit && (
                  <div className="bg-white/10 border border-white/30 rounded-lg p-4">
                    <p className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] text-sm">
                      Maximum group size of {MAX_GROUP_MEMBERS} people reached.
                      Remove a member to add more.
                    </p>
                  </div>
                )}

                {/* Lead member (always shown) */}
                <Card className="bg-black/5 border-black/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-black text-white">Lead</Badge>
                      <span className="font-medium">{leadInfo.name || 'You'}</span>
                    </div>
                    <p className="text-sm text-gray-600">{leadInfo.email}</p>
                    {leadInfo.serviceIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {leadInfo.serviceIds.map(serviceId => {
                          const service = services.find(s => s.id === serviceId);
                          return service ? (
                            <Badge key={serviceId} className="text-xs bg-black text-white">
                              {service.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional members */}
                {members.map((member, index) => (
                  <Card key={member.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">Member {index + 2}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={member.name}
                            onChange={e => updateMember(member.id, 'name', e.target.value)}
                            placeholder="Member name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={member.email}
                            onChange={e => updateMember(member.id, 'email', e.target.value)}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={member.phone}
                            onChange={e => updateMember(member.id, 'phone', e.target.value)}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-gray-900 font-medium">Services (Select Multiple)</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-800 rounded-lg p-3 bg-black/95">
                            {Object.entries(
                              services.reduce((acc, service) => {
                                const cat = service.category || 'Other';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(service);
                                return acc;
                              }, {} as Record<string, typeof services>)
                            ).map(([category, categoryServices]) => (
                              <div key={category} className="space-y-1">
                                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{category}</p>
                                {categoryServices.map(service => (
                                  <label
                                    key={service.id}
                                    className={cn(
                                      'flex items-center gap-2 p-2 rounded cursor-pointer transition-all text-sm',
                                      member.serviceIds.includes(service.id)
                                        ? 'bg-white text-black border border-white'
                                        : 'bg-black/50 text-white border border-white/20 hover:border-white/50'
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={member.serviceIds.includes(service.id)}
                                      onChange={() => toggleMemberService(member.id, service.id)}
                                      className="w-4 h-4 rounded border-white/30 bg-transparent checked:bg-black checked:border-black focus:ring-white"
                                    />
                                    <span className="flex-1 truncate">{service.name}</span>
                                    <span className={cn(
                                      'font-medium',
                                      member.serviceIds.includes(service.id) ? 'text-black' : 'text-white/70'
                                    )}>${service.price}</span>
                                  </label>
                                ))}
                              </div>
                            ))}
                          </div>
                          {member.serviceIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {member.serviceIds.map(serviceId => {
                                const service = services.find(s => s.id === serviceId);
                                return service ? (
                                  <Badge key={serviceId} className="text-xs bg-black text-white border border-black">
                                    {service.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {members.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">No additional members yet</p>
                    <p className="text-sm text-gray-500">
                      You can add members now or share a link after booking
                    </p>
                  </div>
                )}

                {/* Discount info */}
                {totalMembers >= 2 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">
                        {discount}% Group Discount Applied!
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Groups of {totalMembers} people qualify for {discount}% off
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Schedule */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Booking Date
                    </Label>
                    <Input
                      type="date"
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Start Time
                    </Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.map(slot => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Scheduling Preference</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'parallel', label: 'All Together', desc: 'Same time, different stylists' },
                      { value: 'sequential', label: 'One After Another', desc: 'Back-to-back appointments' },
                      { value: 'staggered', label: 'Staggered', desc: 'Overlapping start times' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setSchedulingType(option.value)}
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-all',
                          schedulingType === option.value
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Requests</Label>
                  <Textarea
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements, allergies, or requests..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Group Type</span>
                        <span className="font-medium">
                          {groupType && `${GROUP_TYPE_ICONS[groupType]} ${GROUP_TYPE_LABELS[groupType]}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Group Name</span>
                        <span className="font-medium">
                          {groupName || `${leadInfo.name}'s ${groupType ? GROUP_TYPE_LABELS[groupType] : 'Party'}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium">
                          {format(parseISO(bookingDate), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time</span>
                        <span className="font-medium">{startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Members</span>
                        <span className="font-medium">{totalMembers} people</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lead Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{leadInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{leadInfo.email}</span>
                      </div>
                      {leadInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{leadInfo.phone}</span>
                        </div>
                      )}
                      {leadInfo.serviceIds.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-500 mb-2">Selected Services:</p>
                          <div className="flex flex-wrap gap-1">
                            {leadInfo.serviceIds.map(serviceId => {
                              const service = services.find(s => s.id === serviceId);
                              return service ? (
                                <Badge key={serviceId} className="text-xs bg-black text-white">
                                  {service.name} - ${service.price}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {members.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Group Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {members.map((member, index) => (
                          <div
                            key={member.id}
                            className="p-3 bg-gray-50 rounded space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{member.name || `Member ${index + 2}`}</span>
                              {member.serviceIds.length > 0 && (
                                <span className="text-sm text-gray-500">
                                  {member.serviceIds.length} service{member.serviceIds.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {member.serviceIds.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {member.serviceIds.map(serviceId => {
                                  const service = services.find(s => s.id === serviceId);
                                  return service ? (
                                    <Badge key={serviceId} className="text-xs bg-black text-white">
                                      {service.name} - ${service.price}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pricing Summary */}
                {subtotal > 0 && (
                  <Card className="bg-black text-white">
                    <CardHeader>
                      <CardTitle className="text-lg">Pricing Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Subtotal</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Group Discount ({discount}%)</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator className="bg-white/20" />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/70 text-sm">
                        <span>Deposit Required (50%)</span>
                        <span>${depositRequired.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300">
                  <CardHeader>
                    <CardTitle className="text-lg">Important Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>A 50% deposit is required to confirm your group booking.</p>
                    <p>Cancellations require 72 hours notice for groups.</p>
                    <p>After booking, you'll receive a share link for additional members to join.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {loading ? 'Creating...' : 'Confirm Group Booking'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
