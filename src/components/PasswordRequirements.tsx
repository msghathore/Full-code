import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    validator: (password) => password.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Contains lowercase letter',
    validator: (password) => /[a-z]/.test(password),
  },
  {
    label: 'Contains a number',
    validator: (password) => /\d/.test(password),
  },
];

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  className,
}) => {
  const hasStartedTyping = password.length > 0;

  return (
    <div className={cn('space-y-2 mt-3', className)}>
      <p className="text-white/60 text-sm mb-2">Password must have:</p>
      <ul className="space-y-1.5">
        {requirements.map((requirement, index) => {
          const isMet = requirement.validator(password);
          const showStatus = hasStartedTyping;

          return (
            <li
              key={index}
              className={cn(
                'flex items-center gap-2 text-sm transition-all duration-300',
                showStatus
                  ? isMet
                    ? 'text-green-400'
                    : 'text-red-400'
                  : 'text-white/50'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300',
                  showStatus
                    ? isMet
                      ? 'bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                      : 'bg-red-500/20'
                    : 'bg-white/10'
                )}
              >
                {showStatus ? (
                  isMet ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <X className="w-3 h-3 text-red-400" />
                  )
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                )}
              </span>
              <span
                className={cn(
                  'transition-all duration-300',
                  showStatus && isMet && '[text-shadow:0_0_10px_rgba(34,197,94,0.5)]'
                )}
              >
                {requirement.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Hook to check if all requirements are met
export const usePasswordValidation = (password: string) => {
  const allMet = requirements.every((req) => req.validator(password));
  const metCount = requirements.filter((req) => req.validator(password)).length;
  const totalCount = requirements.length;

  return {
    allMet,
    metCount,
    totalCount,
    percentage: (metCount / totalCount) * 100,
  };
};

export default PasswordRequirements;
