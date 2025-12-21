import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

// Check if running in test mode (set via window or query param)
const isTestMode = () => {
    if (typeof window !== 'undefined') {
        // Check for test mode flag or Playwright
        return (window as any).__POPUP_TEST_MODE__ === true ||
            window.location.search.includes('popupTestMode=true');
    }
    return false;
};

// Smart popup configuration based on industry best practices
const getPopupConfig = () => {
    const testMode = isTestMode();

    return {
        // Timing thresholds (reduced in test mode)
        MIN_TIME_ON_PAGE: testMode ? 3000 : 15000,        // 3s test / 15s production
        DESKTOP_DELAY: testMode ? 8000 : 45000,           // 8s test / 45s production
        MOBILE_DELAY: testMode ? 10000 : 60000,           // 10s test / 60s production

        // Engagement thresholds
        MIN_SCROLL_PERCENT: 50,         // Must scroll 50% before popup can trigger
        ENGAGED_SCROLL_PERCENT: 75,     // 75% scroll = highly engaged visitor

        // Frequency capping
        SESSION_LIMIT: 1,               // Max 1 popup per session
        WEEKLY_COOLDOWN_DAYS: 7,        // Don't show again for 7 days after dismiss

        // Exit intent sensitivity
        DESKTOP_EXIT_THRESHOLD: 20,     // pixels from top to trigger exit intent
        MOBILE_SCROLL_VELOCITY: 3,      // scroll speed threshold for mobile exit

        // Pages to exclude (don't interrupt conversion flow)
        EXCLUDED_PATHS: [
            '/booking',
            '/checkout',
            '/book',
            '/payment',
            '/cart',
            '/staff',
            '/auth',
            '/login'
        ],

        // Test mode flag
        IS_TEST_MODE: testMode
    };
};

// Config is evaluated inside useEffect to ensure query params are available

interface PopupState {
    hasScrolledEnough: boolean;
    hasSpentMinTime: boolean;
    scrollPercent: number;
    timeOnPage: number;
    isEngaged: boolean;
}

export const SecretDealsDialog = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ hours: 36, minutes: 0, seconds: 0 });
    const { toast } = useToast();
    const location = useLocation();

    const [isMobile, setIsMobile] = useState(false);
    const [popupState, setPopupState] = useState<PopupState>({
        hasScrolledEnough: false,
        hasSpentMinTime: false,
        scrollPercent: 0,
        timeOnPage: 0,
        isEngaged: false
    });

    // Check if popup should be blocked
    const shouldBlockPopup = useCallback((): { blocked: boolean; reason: string } => {
        const config = getPopupConfig();

        // Check excluded paths
        const currentPath = location.pathname.toLowerCase();
        const isExcludedPath = config.EXCLUDED_PATHS.some(path =>
            currentPath.startsWith(path)
        );
        if (isExcludedPath) {
            return { blocked: true, reason: 'excluded_path' };
        }

        // Check if already dismissed permanently
        const dismissedAt = localStorage.getItem('secretDealsDismissedAt');
        if (dismissedAt) {
            const dismissDate = new Date(parseInt(dismissedAt));
            const daysSinceDismiss = (Date.now() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceDismiss < config.WEEKLY_COOLDOWN_DAYS) {
                return { blocked: true, reason: 'weekly_cooldown' };
            }
        }

        // Check session limit
        const sessionShows = parseInt(sessionStorage.getItem('secretDealsShown') || '0');
        if (sessionShows >= config.SESSION_LIMIT) {
            return { blocked: true, reason: 'session_limit' };
        }

        // Check if user already subscribed
        if (localStorage.getItem('secretDealsSubscribed') === 'true') {
            return { blocked: true, reason: 'already_subscribed' };
        }

        return { blocked: false, reason: '' };
    }, [location.pathname]);

    // Show popup with smart logging - no dependencies to avoid re-renders
    const showPopup = useCallback((trigger: string, scrollPercent: number = 0, timeOnPage: number = 0) => {
        const blockCheck = shouldBlockPopup();
        if (blockCheck.blocked) {
            console.log(`🚫 Popup blocked: ${blockCheck.reason}`);
            return;
        }

        console.log(`✅ Showing popup (trigger: ${trigger}, scroll: ${scrollPercent}%, time: ${Math.round(timeOnPage / 1000)}s)`);

        // Update session counter
        const currentShows = parseInt(sessionStorage.getItem('secretDealsShown') || '0');
        sessionStorage.setItem('secretDealsShown', (currentShows + 1).toString());

        setIsOpen(true);
    }, [shouldBlockPopup]);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Main popup logic
    useEffect(() => {
        // Get config at runtime to ensure query params are available
        const POPUP_CONFIG = getPopupConfig();

        // Inline blocking checks to avoid dependency issues
        const currentPath = location.pathname.toLowerCase();
        const isExcludedPath = POPUP_CONFIG.EXCLUDED_PATHS.some(path =>
            currentPath.startsWith(path)
        );

        if (isExcludedPath) {
            console.log('🔒 Popup disabled: excluded_path');
            return;
        }

        const dismissedAt = localStorage.getItem('secretDealsDismissedAt');
        if (dismissedAt) {
            const daysSinceDismiss = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismiss < POPUP_CONFIG.WEEKLY_COOLDOWN_DAYS) {
                console.log('🔒 Popup disabled: weekly_cooldown');
                return;
            }
        }

        const sessionShows = parseInt(sessionStorage.getItem('secretDealsShown') || '0');
        if (sessionShows >= POPUP_CONFIG.SESSION_LIMIT) {
            console.log('🔒 Popup disabled: session_limit');
            return;
        }

        if (localStorage.getItem('secretDealsSubscribed') === 'true') {
            console.log('🔒 Popup disabled: already_subscribed');
            return;
        }

        console.log('🎯 Smart popup initialized with config:', {
            minTime: `${POPUP_CONFIG.MIN_TIME_ON_PAGE / 1000}s`,
            minScroll: `${POPUP_CONFIG.MIN_SCROLL_PERCENT}%`,
            device: isMobile ? 'mobile' : 'desktop',
            testMode: POPUP_CONFIG.IS_TEST_MODE
        });

        let startTime = Date.now();
        let hasTriggered = false;
        let currentScrollPercent = 0;

        // Track time on page
        const timeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            setPopupState(prev => ({
                ...prev,
                timeOnPage: elapsed,
                hasSpentMinTime: elapsed >= POPUP_CONFIG.MIN_TIME_ON_PAGE
            }));
        }, 1000);

        // Track scroll depth
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            // If page is not scrollable (fits in viewport), treat as 100% scrolled
            const newScrollPercent = scrollHeight > 0
                ? Math.round((window.scrollY / scrollHeight) * 100)
                : 100;
            currentScrollPercent = newScrollPercent;

            setPopupState(prev => ({
                ...prev,
                scrollPercent: currentScrollPercent,
                hasScrolledEnough: currentScrollPercent >= POPUP_CONFIG.MIN_SCROLL_PERCENT,
                isEngaged: currentScrollPercent >= POPUP_CONFIG.ENGAGED_SCROLL_PERCENT
            }));
        };

        // Exit intent detection - Desktop
        let lastMouseY = 0;
        const handleMouseMove = (e: MouseEvent) => {
            if (hasTriggered || isMobile) return;

            const elapsed = Date.now() - startTime;
            const hasMinRequirements =
                elapsed >= POPUP_CONFIG.MIN_TIME_ON_PAGE &&
                currentScrollPercent >= POPUP_CONFIG.MIN_SCROLL_PERCENT;

            // Detect exit intent (mouse moving toward top rapidly)
            if (e.clientY < POPUP_CONFIG.DESKTOP_EXIT_THRESHOLD &&
                lastMouseY > e.clientY &&
                hasMinRequirements) {
                hasTriggered = true;
                console.log(`✅ Showing popup (trigger: desktop_exit_intent, scroll: ${currentScrollPercent}%, time: ${Math.round(elapsed / 1000)}s)`);
                sessionStorage.setItem('secretDealsShown', '1');
                setIsOpen(true);
            }
            lastMouseY = e.clientY;
        };

        // Exit intent detection - Mobile (scroll up rapidly at bottom)
        let lastScrollY = window.scrollY;
        let lastScrollTime = Date.now();

        const handleMobileScroll = () => {
            if (hasTriggered || !isMobile) return;

            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const scrollDelta = lastScrollY - window.scrollY; // Positive = scrolling up
            const timeDelta = currentTime - lastScrollTime;
            const velocity = timeDelta > 0 ? Math.abs(scrollDelta) / timeDelta : 0;

            const hasMinRequirements =
                elapsed >= POPUP_CONFIG.MIN_TIME_ON_PAGE &&
                currentScrollPercent >= POPUP_CONFIG.MIN_SCROLL_PERCENT;

            // Fast scroll up while engaged
            if (velocity > POPUP_CONFIG.MOBILE_SCROLL_VELOCITY &&
                scrollDelta > 0 &&
                hasMinRequirements) {
                hasTriggered = true;
                console.log(`✅ Showing popup (trigger: mobile_exit_intent, scroll: ${currentScrollPercent}%, time: ${Math.round(elapsed / 1000)}s)`);
                sessionStorage.setItem('secretDealsShown', '1');
                setIsOpen(true);
            }

            lastScrollY = window.scrollY;
            lastScrollTime = currentTime;
        };

        // Fallback timer (shows popup after delay if user is engaged)
        const fallbackDelay = isMobile ? POPUP_CONFIG.MOBILE_DELAY : POPUP_CONFIG.DESKTOP_DELAY;
        const fallbackTimer = setTimeout(() => {
            if (!hasTriggered && currentScrollPercent >= POPUP_CONFIG.MIN_SCROLL_PERCENT) {
                hasTriggered = true;
                console.log(`✅ Showing popup (trigger: timed_fallback, scroll: ${currentScrollPercent}%, time: ${Math.round(fallbackDelay / 1000)}s)`);
                sessionStorage.setItem('secretDealsShown', '1');
                setIsOpen(true);
            }
        }, fallbackDelay);

        // Countdown timer for the offer
        const countdownInterval = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                }
                return { hours, minutes, seconds };
            });
        }, 1000);

        // Add event listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('scroll', handleMobileScroll, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Initial scroll check
        handleScroll();

        return () => {
            clearInterval(timeInterval);
            clearInterval(countdownInterval);
            clearTimeout(fallbackTimer);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll', handleMobileScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile, location.pathname]);

    const formatPhoneNumber = (value: string) => {
        const phoneNumber = value.replace(/\D/g, '');
        if (phoneNumber.length <= 3) {
            return phoneNumber;
        } else if (phoneNumber.length <= 6) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        } else {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem('secretDealsDismissedAt', Date.now().toString());
        console.log('👋 Popup dismissed - will not show for 7 days');
    };

    const handleSecretDealsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber.trim()) {
            toast({
                title: "Error",
                description: "Please enter your phone number.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('📱 Secret deals signup:', phoneNumber);

            toast({
                title: "🎉 Exclusive Access Granted!",
                description: "You'll receive our secret deals via SMS soon!",
            });

            setIsOpen(false);
            localStorage.setItem('secretDealsSubscribed', 'true');
            localStorage.setItem('secretDealsDismissedAt', Date.now().toString());
            setPhoneNumber('');
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
            {/* Custom Backdrop with Heavy Blur */}
            {isOpen && (
                <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm" />
            )}
            <DialogContent
                className="
                    frosted-glass border-white/20 z-[1200] shadow-2xl shadow-white/20
                    fixed bottom-0 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] rounded-t-2xl rounded-b-none
                    sm:static sm:bottom-auto sm:left-auto sm:translate-x-0 sm:w-[95vw] sm:max-w-md sm:mx-auto sm:mt-10 sm:rounded-xl
                    md:w-[85vw] md:max-w-lg md:mt-16
                    lg:w-[70vw] lg:max-w-xl lg:mt-20
                    animate-in slide-in-from-bottom sm:slide-in-from-top duration-300
                "
            >
                <DialogHeader className="text-center px-6 sm:px-8 md:px-10">
                    <DialogTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-light text-white mb-3 sm:mb-4 text-center w-full">
                        SECRET DEALS
                    </DialogTitle>
                    <div className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed text-center px-4">
                        Join our exclusive VIP list and unlock <span className="font-bold">50% OFF</span> on premium services,
                        <span className="font-bold"> free upgrades</span>, and <span className="font-bold">early access</span> to new treatments.
                        <br /><br />
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-xs sm:text-sm text-white/60">Offer expires in:</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-mono font-bold">
                            <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/10 rounded border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20">
                                {timeLeft.hours.toString().padStart(2, '0')}
                            </span>
                            <span className="text-white/60 px-0.5 sm:px-1">:</span>
                            <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/10 rounded border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20">
                                {timeLeft.minutes.toString().padStart(2, '0')}
                            </span>
                            <span className="text-white/60 px-0.5 sm:px-1">:</span>
                            <span className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/10 rounded border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20">
                                {timeLeft.seconds.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSecretDealsSubmit} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 px-4 sm:px-0">
                    <div className="text-center">
                        <label className="text-xs sm:text-sm text-white/70 mb-2 sm:mb-3 block tracking-wider">YOUR PHONE NUMBER</label>
                        <Input
                            type="text"
                            inputMode="tel"
                            pattern="[0-9\-\+\(\)\s]+"
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            placeholder="+1 (555) 000-0000"
                            className="bg-black/50 border-white/20 text-white placeholder:text-white/30 text-center text-base sm:text-lg py-3 sm:py-4 caret-white mx-auto w-full max-w-xs"
                            required
                            autoFocus={false}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center pb-2 sm:pb-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDismiss}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto text-sm sm:text-base"
                            disabled={isSubmitting}
                        >
                            Maybe Later
                        </Button>
                        <Button
                            type="submit"
                            variant="cta"
                            className="px-4 sm:px-6 py-2.5 sm:py-3 font-serif text-sm sm:text-base tracking-wider font-bold w-full sm:w-auto"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'JOINING...' : 'CLAIM DEALS'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
});
