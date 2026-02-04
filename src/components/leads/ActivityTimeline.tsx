import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CheckCircle, Mail, Play, PlusCircle } from 'lucide-react';

interface Activity {
    id: string;
    type: 'email_verified' | 'flow_run' | 'created';
    timestamp: Date;
    description: string;
}

const mockActivities: Activity[] = [
    { id: '1', type: 'email_verified', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), description: 'Email verification completed: Valid' },
    { id: '2', type: 'flow_run', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), description: 'Executed "Lead Scoring" flow' },
    { id: '3', type: 'created', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), description: 'Lead imported from CSV' },
];

export function ActivityTimeline() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-gray-400">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {mockActivities.map((activity) => (
                        <div key={activity.id} className="relative flex items-start group">
                            {/* Timeline Dot */}
                            <div className="absolute left-0 mt-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-gray-600 group-hover:bg-accent transition-colors ml-[15px]" />

                            <div className="ml-10 w-full">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-white">{formatType(activity.type)}</span>
                                    <time className="text-xs text-gray-500">{activity.timestamp.toLocaleDateString()}</time>
                                </div>
                                <p className="text-sm text-gray-400">
                                    {activity.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function formatType(type: string) {
    switch (type) {
        case 'email_verified': return 'Email Verified';
        case 'flow_run': return 'Flow Run';
        case 'created': return 'Created';
        default: return type;
    }
}
