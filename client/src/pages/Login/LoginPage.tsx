import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import authService from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { ShoppingBag, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await authService.login({ usernameOrEmail, password });
            login(data.user, data.token);

            // Role-based redirect: Admin -> Dashboard, User -> Home
            if (data.user.roles.includes('Admin')) {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            console.error(err);
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">

                {/* Left Side - Branding & Content */}
                <div className="hidden lg:block space-y-8 pr-8 animate-fade-in-left">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-indigo-100 border border-indigo-50">
                            <ShoppingBag className="h-6 w-6 text-primary-600" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-gray-900">CLEAN-PJ</span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold leading-tight text-gray-900">
                            Start your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                                journey today
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-md leading-relaxed">
                            Access your personalized dashboard, track your orders, and discover exclusive deals tailored just for you.
                        </p>
                    </div>

                    {/* Stats/Social Proof */}
                    <div className="flex gap-8 pt-6 border-t border-gray-200">
                        <div>
                            <p className="text-3xl font-bold text-gray-900">10k+</p>
                            <p className="text-sm text-gray-500">Active Users</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">24/7</p>
                            <p className="text-sm text-gray-500">Support</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">4.9</p>
                            <p className="text-sm text-gray-500">App Rating</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden animate-fade-in-up">
                    {/* Decorative Background Blob inside card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60 pointer-events-none"></div>

                    <div className="relative">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                            <p className="text-gray-500 mt-2">Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username/Email Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Email or Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={usernameOrEmail}
                                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200 shadow-sm"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-medium text-gray-700">Password</label>
                                    <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="block w-full pl-11 pr-12 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200 shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm animate-fade-in-up">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    {error}
                                </div>
                            )}

                            {/* Login Button */}
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full py-4 rounded-2xl text-base font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white/50 backdrop-blur-sm text-sm text-gray-400 font-medium tracking-wide">OR CONTINUE WITH</span>
                            </div>
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 group shadow-sm">
                                <svg className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 group shadow-sm">
                                <svg className="h-5 w-5 text-[#1877F2] group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Facebook</span>
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-500">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1 group">
                                    Sign Up
                                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
