import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StaffLogin = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple hardcoded password check as requested
        if (password === '1234') {
            // Log staff login with timestamp
            const loginTime = new Date().toISOString();
            const loginData = {
                timestamp: loginTime,
                userAgent: navigator.userAgent,
                ip: 'unknown', // Would need server-side logging for actual IP
                action: 'staff_login'
            };

            // Store in localStorage for now (in production, send to server)
            const existingLogs = JSON.parse(localStorage.getItem('staff_login_logs') || '[]');
            existingLogs.push(loginData);
            localStorage.setItem('staff_login_logs', JSON.stringify(existingLogs));

            // Also log to console for debugging
            console.log('Staff login recorded:', loginData);

            localStorage.setItem('staff_auth_token', 'valid_token');
            toast({
                title: "Login Successful",
                description: "Welcome back to the staff dashboard.",
            });
            navigate('/staff/calendar');
        } else {
            toast({
                title: "Access Denied",
                description: "Incorrect password. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                        <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Staff Access</CardTitle>
                    <CardDescription>
                        Please enter your staff password to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="text-center text-lg tracking-widest"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Unlock Dashboard
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffLogin;
