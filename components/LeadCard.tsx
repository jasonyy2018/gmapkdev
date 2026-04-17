import { ExternalLink, MapPin, Globe, Star, Code, Phone, Mail, Loader2, Sparkles, Wand2 } from 'lucide-react';
import type { Lead } from "@/lib/types";
import { leadsApi } from "@/lib/api-client";

interface LeadProps {
    lead: Lead;
    onSelectLead: (lead: Lead) => void;
    onUpdate: () => void;
}

const LeadCard: React.FC<LeadProps> = ({ lead, onSelectLead, onUpdate }) => {
    const getScoreColor = (score?: number) => {
        if (!score) return 'text-gray-500';
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-amber-400';
        return 'text-rose-400';
    };

    const handleAnalyze = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await leadsApi.analyze(lead.id);
            onUpdate();
        } catch (error) {
            console.error('Failed to trigger analysis:', error);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {lead.name}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px]">{lead.address || 'No address'}</span>
                        </div>
                        {lead.contact_email && (
                            <div className="flex items-center gap-2 text-indigo-400 text-sm">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[200px]">{lead.contact_email}</span>
                            </div>
                        )}
                    </div>
                </div>
                {lead.ai_score && (
                    <div className="flex flex-col items-end">
                        <div className={`text-2xl font-bold ${getScoreColor(lead.ai_score)}`}>
                            {lead.ai_score}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">AI Score</div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {lead.rating && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{lead.rating}</span>
                    </div>
                )}
                {lead.website && (
                    <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                    >
                        <Globe className="w-3 h-3" />
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
                {lead.phone && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                    </div>
                )}
                {lead.contact_email && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400">
                        <Mail className="w-3 h-3" />
                        <span>{lead.contact_email}</span>
                    </div>
                )}
            </div>

            {lead.ai_status === 'analyzing' || lead.ai_status === 'pending' ? (
                <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse py-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>AI Analysis in progress...</span>
                </div>
            ) : (lead.ai_tags?.length || lead.analysis?.tech_stack?.length) ? (
                <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        <Code className="w-3 h-3" />
                        Key Insights & Stack
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {(lead.ai_tags || lead.analysis?.tech_stack || []).slice(0, 6).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-indigo-300">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {lead.ai_grade && (
                <div className="absolute top-0 right-0 p-2">
                    <div className={`w-6 h-6 rounded-bl-xl flex items-center justify-center text-[10px] font-black
            ${lead.ai_grade === 'A' ? 'bg-indigo-500 text-white' :
                            lead.ai_grade === 'B' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                        {lead.ai_grade}
                    </div>
                </div>
            )}

            <div className="mt-6 flex gap-2">
                {lead.website && (
                    <button
                        onClick={handleAnalyze}
                        disabled={lead.ai_status === 'analyzing' || lead.ai_status === 'pending'}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        {lead.ai_status === 'analyzing' || lead.ai_status === 'pending' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        {lead.ai_status === 'completed' ? 'Re-analyze' :
                            (lead.ai_status === 'analyzing' || lead.ai_status === 'pending') ? 'Analyzing...' : 'Analyze'}
                    </button>
                )}
                {lead.ai_status === 'completed' && (
                    <button
                        onClick={() => onSelectLead(lead)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 group/btn"
                    >
                        <Wand2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                        Marketing
                    </button>
                )}
            </div>
        </div>
    );
};

export default LeadCard;
