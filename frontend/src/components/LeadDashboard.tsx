import React from 'react';
import LeadCard from './LeadCard';
import { Loader2, Users } from 'lucide-react';

interface LeadDashboardProps {
    leads: any[];
    isLoading: boolean;
}

const LeadDashboard: React.FC<LeadDashboardProps> = ({ leads, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-500">Searching and discovering leads...</p>
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-white/5 bg-white/[0.02] rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Leads Discovered</h3>
                <p className="text-gray-500 max-w-xs text-center">
                    Start a search above to discover business leads and analyze them with AI.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
            ))}
        </div>
    );
};

export default LeadDashboard;
