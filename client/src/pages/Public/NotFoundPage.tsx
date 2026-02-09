
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button } from '../../components/ui/Button';
import { Home, Search, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <PublicLayout>
            <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="relative mb-8">
                        <h1 className="text-9xl font-bold text-primary-100">404</h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900 bg-gray-50 px-4">Page Not Found</span>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-8 text-lg">
                        Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate('/')}
                            className="bg-primary-600 hover:bg-primary-700 gap-2"
                            size="lg"
                        >
                            <Home className="h-5 w-5" />
                            Go Home
                        </Button>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="secondary"
                            className="gap-2 bg-white"
                            size="lg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Go Back
                        </Button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
                        <div className="relative max-w-xs mx-auto">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};
