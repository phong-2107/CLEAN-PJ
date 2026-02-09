
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button } from '../../components/ui/Button';
import { Users, Target, Heart, Award } from 'lucide-react';

export const AboutPage = () => {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="relative py-20 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        We are on a mission to revolutionize the way people shop online by providing quality products and exceptional service.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Founded in 2024, CLEAN-PJ started with a simple idea: to make premium products accessible to everyone. What began as a small operation has grown into a global marketplace, connecting millions of customers with the products they love.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                We believe in quality, transparency, and customer satisfaction. Every product on our platform is carefully curated to ensure it meets our high standards.
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-6">
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">50k+</div>
                                    <div className="text-sm text-gray-500">Happy Customers</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">10k+</div>
                                    <div className="text-sm text-gray-500">Products Sold</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
                                    <div className="text-sm text-gray-500">Customer Support</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-600 mb-2">99%</div>
                                    <div className="text-sm text-gray-500">Satisfaction Rate</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-2xl bg-gray-100 overflow-hidden shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                                    alt="Team working together"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-xs">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Award className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="font-semibold text-gray-900">Certified Quality</span>
                                </div>
                                <p className="text-sm text-gray-500">Recognized for excellence in e-commerce and customer service.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Core Values</h2>
                        <p className="text-gray-500 mt-2">The principles that guide everything we do</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target,
                                title: 'Customer First',
                                desc: 'We prioritize our customers needs and satisfaction above all else.'
                            },
                            {
                                icon: Heart,
                                title: 'Passion for Quality',
                                desc: 'We are passionate about delivering products that exceed expectations.'
                            },
                            {
                                icon: Users,
                                title: 'Community Driven',
                                desc: 'We build strong relationships with our community and partners.'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
                                    <item.icon className="h-6 w-6 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Experience the Difference?</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Join thousands of satisfied customers and shop with confidence today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                            Shop Now
                        </Button>
                        <Button size="lg" variant="secondary">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};
