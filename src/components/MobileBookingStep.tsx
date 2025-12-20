import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileBookingStepProps {
  children: ReactNode;
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextButtonText?: string;
}

export const MobileBookingStep = ({
  children,
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  nextButtonText = 'Next'
}: MobileBookingStepProps) => {
  return (
    <div className="w-full flex flex-col h-full">
      {/* Step Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif luxury-glow text-white">
            {title}
          </h2>
          <div className="text-sm text-white/60">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </div>
        <p className="text-white/70 text-sm">
          {description}
        </p>
      </div>

      {/* Step Content - Full width, no gaps */}
      <div className="flex-1 mb-6">
        <div className="space-y-4">
          {children}
        </div>
      </div>

      {/* Navigation Buttons - Fixed at bottom */}
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
        <Button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
          variant="outline"
          className="flex items-center gap-2 min-w-[120px]"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 min-w-[120px]"
        >
          {nextButtonText}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};