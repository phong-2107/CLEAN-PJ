import React, { useState } from 'react';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button } from '../../components/ui/Button';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';


export const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubmitting(false);
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <PublicLayout>
            <div className="bg-gray-50 min-h-screen py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-gray-900">Get in Touch</h1>
                        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                            Have questions about our products or services? We're here to help.
                            Reach out to us and we'll respond as soon as we can.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary-50 rounded-lg">
                                            <Phone className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Phone</p>
                                            <p className="text-gray-600">+1 (555) 123-4567</p>
                                            <p className="text-sm text-gray-400 mt-1">Mon-Fri 9am-6pm</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary-50 rounded-lg">
                                            <Mail className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Email</p>
                                            <p className="text-gray-600">support@cleanpj.com</p>
                                            <p className="text-sm text-gray-400 mt-1">24/7 Support</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary-50 rounded-lg">
                                            <MapPin className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Office</p>
                                            <p className="text-gray-600">
                                                123 Business Avenue<br />
                                                Suite 400<br />
                                                New York, NY 10001
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="bg-gray-200 rounded-2xl h-64 w-full flex items-center justify-center text-gray-500 font-medium">
                                Map Integration Placeholder
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
                                {submitted ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                            <Send className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-900">Message Sent!</h4>
                                        <p className="text-gray-600 mt-2">
                                            Thank you for contacting us. We'll get back to you shortly.
                                        </p>
                                        <Button
                                            className="mt-6"
                                            onClick={() => setSubmitted(false)}
                                        >
                                            Send Another Message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                required
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                placeholder="How can we help?"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                                                placeholder="Tell us more about your inquiry..."
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full sm:w-auto px-8 py-3 h-auto text-base"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                'Send Message'
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};
