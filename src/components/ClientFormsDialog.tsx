import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface ClientForm {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'incomplete';
  completedDate?: string;
  size?: string;
  description?: string;
}

interface ClientFormsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: {
    id: string;
    full_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    phone?: string;
    email?: string;
    total_amount?: number;
    notes?: string;
  };
}

// Mock data for client forms - in a real app, this would come from an API
const getClientForms = (appointmentId: string): ClientForm[] => {
  const mockForms: { [key: string]: ClientForm[] } = {
    '1': [
      {
        id: 'form-001',
        name: 'New Client Intake Form',
        status: 'completed',
        completedDate: '2024-11-20',
        size: '2.3 MB',
        description: 'Initial client information and medical history'
      },
      {
        id: 'form-002',
        name: 'Service Consent Form',
        status: 'completed',
        completedDate: '2024-11-20',
        size: '1.1 MB',
        description: 'Consent for hair styling services'
      },
      {
        id: 'form-003',
        name: 'Allergy Information',
        status: 'completed',
        completedDate: '2024-11-20',
        size: '856 KB',
        description: 'Client allergies and sensitivities'
      }
    ],
    '2': [
      {
        id: 'form-004',
        name: 'Nail Service Intake',
        status: 'completed',
        completedDate: '2024-11-21',
        size: '1.8 MB',
        description: 'Manicure service questionnaire'
      },
      {
        id: 'form-005',
        name: 'Health Declaration',
        status: 'pending',
        size: '945 KB',
        description: 'Health status declaration for nail services'
      }
    ],
    '3': [
      {
        id: 'form-006',
        name: 'Hair Service Waiver',
        status: 'completed',
        completedDate: '2024-11-22',
        size: '1.5 MB',
        description: 'Waiver for chemical hair treatments'
      }
    ]
  };

  // Return forms for specific appointment or default forms
  return mockForms[appointmentId] || [
    {
      id: 'form-default-001',
      name: 'Client Intake Form',
      status: 'completed',
      completedDate: format(new Date(), 'yyyy-MM-dd'),
      size: '2.1 MB',
      description: 'Basic client information and preferences'
    },
    {
      id: 'form-default-002',
      name: 'Service Consent Form',
      status: 'completed',
      completedDate: format(new Date(), 'yyyy-MM-dd'),
      size: '1.3 MB',
      description: 'Consent for requested services'
    },
    {
      id: 'form-default-003',
      name: 'Medical History Form',
      status: 'pending',
      size: '1.7 MB',
      description: 'Medical history and allergy information'
    }
  ];
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Completed'
      };
    case 'pending':
      return {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Pending'
      };
    case 'incomplete':
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Incomplete'
      };
    default:
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: 'Unknown'
      };
  }
};

const ClientFormsDialog: React.FC<ClientFormsDialogProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  if (!appointment) return null;

  const forms = getClientForms(appointment.id);
  const completedForms = forms.filter(form => form.status === 'completed').length;
  const pendingForms = forms.filter(form => form.status === 'pending').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-black text-lg font-semibold">
            <FileText className="h-5 w-5" />
            Client Forms
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            View and manage forms associated with this appointment
          </DialogDescription>
        </DialogHeader>

        {/* Client Information Header */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-black text-lg">{appointment.full_name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(appointment.appointment_date), 'MMM d, yyyy')} at {appointment.appointment_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{appointment.service_name}</span>
                </div>
                {appointment.phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span>
                    <span>{appointment.phone}</span>
                  </div>
                )}
                {appointment.email && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span>{appointment.email}</span>
                  </div>
                )}
                {appointment.total_amount && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Amount:</span>
                    <span>${appointment.total_amount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Forms Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-black">{forms.length}</div>
            <div className="text-sm text-slate-800 font-medium">Total Forms</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{completedForms}</div>
            <div className="text-sm text-green-800 font-medium">Completed</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingForms}</div>
            <div className="text-sm text-yellow-800 font-medium">Pending</div>
          </div>
        </div>

        {/* Forms List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          <h4 className="font-semibold text-black mb-3">Forms List</h4>
          {forms.map((form) => {
            const statusConfig = getStatusConfig(form.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={form.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <h5 className="font-medium text-black">{form.name}</h5>
                      <Badge 
                        variant="secondary" 
                        className={`${statusConfig.bgColor} ${statusConfig.color} border-0 text-xs font-medium`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    
                    {form.description && (
                      <p className="text-sm text-gray-600 ml-8 mb-2">{form.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 ml-8 text-xs text-gray-500">
                      {form.completedDate && (
                        <span>Completed: {format(new Date(form.completedDate), 'MMM d, yyyy')}</span>
                      )}
                      {form.size && (
                        <span>Size: {form.size}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1 h-auto border-gray-300 text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        // In a real app, this would open/view the form
                        console.log('View form:', form.id);
                      }}
                    >
                      View
                    </Button>
                    
                    {form.status === 'pending' && (
                      <Button
                        size="sm"
                        className="text-xs px-3 py-1 h-auto bg-black hover:bg-slate-800 text-white"
                        onClick={() => {
                          // In a real app, this would allow form completion
                          console.log('Complete form:', form.id);
                        }}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Close
          </Button>
          
          <Button
            className="px-6 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              // In a real app, this might add a new form
              console.log('Add new form for appointment:', appointment.id);
            }}
          >
            Add Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientFormsDialog;