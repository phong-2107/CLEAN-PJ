import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface PlaceholderPageProps {
    title: string;
    description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
    title,
    description = "This feature is currently under development. Stay tuned for updates!"
}) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-gray-500 mt-1">Feature preview</p>
                </div>
                <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={() => navigate('/dashboard')}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

            <Card className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center border-dashed">
                <div className="h-20 w-20 rounded-full bg-primary-50 flex items-center justify-center mb-6">
                    <Construction className="h-10 w-10 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {title} is coming soon!
                </h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    {description}
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/dashboard/help')}>
                        Contact Support
                    </Button>
                </div>
            </Card>
        </div>
    );
};
