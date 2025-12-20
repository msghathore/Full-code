import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const useAutoLogout = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const logout = useCallback(() => {
        // Clear auth token
        localStorage.removeItem('staff_auth_token');

        // Show notification
        toast({
            title: "Session Expired",
            description: "You have been logged out due to inactivity.",
            variant: "destructive",
        });

        // Redirect to login
        navigate('/staff/login');
    }, [navigate, toast]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(logout, TIMEOUT_MS);
    }, [logout]);

    useEffect(() => {
        // Events to track activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Initial timer start
        resetTimer();

        // Add event listeners
        const handleActivity = () => {
            resetTimer();
        };

        events.forEach(event => {
            document.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return { resetTimer };
};
