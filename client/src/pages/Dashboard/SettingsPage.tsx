import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import {
    User,
    Settings,
    Bell,
    Gift,
    Ban,
    Building2,
    Users,
    Folder,
    Smartphone,
    Zap,
    CreditCard,
    BookUser,
    Upload,
    Mail,
    Lock
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const SettingsPage = () => {
    const { user } = useAuthStore();
    const [firstName, setFirstName] = useState(user?.fullName?.split(' ')[0] || 'Dianne');
    const [lastName, setLastName] = useState(user?.fullName?.split(' ')[1] || 'Russell');
    const [email, setEmail] = useState(user?.email || 'russel@hey.com');

    const sidebarItems = [
        {
            category: 'Your account',
            items: [
                { label: 'Profile', icon: User, active: true },
                { label: 'Preferences', icon: Settings },
                { label: 'Notifications', icon: Bell },
                { label: 'Referrals', icon: Gift },
                { label: 'Blocklist', icon: Ban },
            ]
        },
        {
            category: 'Workplace',
            items: [
                { label: 'General', icon: Building2 },
                { label: 'Members', icon: Users },
                { label: 'Groups', icon: Folder },
                { label: 'Phone numbers', icon: Smartphone },
                { label: 'Integrations', icon: Zap },
                { label: 'Plan & billing', icon: CreditCard },
                { label: 'Contacts', icon: BookUser },
            ]
        }
    ];

    return (
        <div className="flex flex-collg:flex-row gap-8 min-h-[800px] bg-gray-50/50 rounded-3xl border border-gray-100 p-6 lg:p-0 overflow-hidden">
            {/* Sidebar */}
            <div className="w-full lg:w-72 flex-shrink-0 lg:border-r border-gray-100 bg-white lg:min-h-full p-6">
                <div className="flex items-center gap-3 mb-8">
                    <Avatar size="md" fallback="DR" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80" />
                    <div>
                        <div className="font-semibold text-gray-900">Dianne Russell</div>
                        {/* <div className="text-xs text-gray-500">Free Account</div> */}
                    </div>
                </div>

                <div className="space-y-8">
                    {sidebarItems.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 pl-3">
                                {section.category}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <button
                                        key={item.label}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                            item.active
                                                ? "bg-gray-100 text-gray-900"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4", item.active ? "text-gray-900" : "text-gray-400")} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:p-10 bg-white">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Account</h2>

                <div className="space-y-10 max-w-3xl">
                    {/* Profile Picture */}
                    <div className="flex items-start gap-6">
                        <Avatar
                            size="xl"
                            className="h-24 w-24"
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80"
                            fallback="DR"
                        />
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                            <div className="flex items-center gap-3">
                                <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white gap-2 shadow-lg shadow-purple-500/20">
                                    <Upload className="h-4 w-4" />
                                    Upload Image
                                </Button>
                                <Button variant="secondary" className="text-gray-600 border border-gray-200 bg-white hover:bg-gray-50">
                                    Remove
                                </Button>
                            </div>
                            <p className="text-sm text-gray-400">
                                We support PNGs, JPEGs and GIFs under 10MB
                            </p>
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#8B5CF6] transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#8B5CF6] transition-all"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#8B5CF6] transition-all"
                                />
                            </div>
                            <Button variant="secondary" className="h-11 border border-gray-200 bg-white hover:bg-gray-50 whitespace-nowrap">
                                Edit Email
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400">Used to log in to your account</p>
                    </div>

                    <div className="border-t border-gray-100 my-8"></div>

                    {/* Password */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900">Password</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Log in with your password instead of using temporary login codes
                            </p>
                        </div>
                        <Button variant="secondary" className="border border-gray-200 bg-white hover:bg-gray-50">
                            Change Password
                        </Button>
                    </div>

                    <div className="border-t border-gray-100 my-8"></div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                            Cancel
                        </Button>
                        <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 shadow-lg shadow-purple-500/20">
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
