import React from 'react';
import { Smartphone, Zap, Globe, ShieldCheck } from 'lucide-react';

interface PosterData {
    title: string;
    subtitle: string;
    key_points: string[];
    call_to_action: string;
    theme_colors: {
        primary: string;
        secondary: string;
    };
    style_vibe: string;
}

interface PosterPreviewProps {
    data: PosterData | null;
    companyName: string;
}

const PosterPreview: React.FC<PosterPreviewProps> = ({ data, companyName }) => {
    if (!data || !data.title) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500">
                <p>No poster data available for this lead yet.</p>
                <p className="text-sm">Try analyzing the lead again.</p>
            </div>
        );
    }

    const primaryColor = data.theme_colors.primary || '#6366f1';
    const secondaryColor = data.theme_colors.secondary || '#a855f7';

    const icons = [Smartphone, Zap, Globe, ShieldCheck];

    return (
        <div className="relative w-full max-w-lg mx-auto aspect-[3/4] bg-[#050505] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
            {/* Background Gradients */}
            <div
                className="absolute top-0 left-0 w-full h-full opacity-20"
                style={{
                    background: `radial-gradient(circle at top left, ${primaryColor}, transparent), radial-gradient(circle at bottom right, ${secondaryColor}, transparent)`
                }}
            />

            {/* Content */}
            <div className="relative h-full p-10 flex flex-col justify-between z-10">
                <div className="space-y-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                        Design Proposal
                    </div>

                    <h2 className="text-4xl font-bold leading-tight tracking-tight">
                        {data.title.split(companyName).map((part, i) => (
                            <React.Fragment key={i}>
                                {part}
                                {i === 0 && data.title.includes(companyName) && (
                                    <span style={{ color: primaryColor }}>{companyName}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </h2>

                    <p className="text-xl text-gray-400 font-medium">
                        {data.subtitle}
                    </p>

                    <div className="h-px w-20 bg-gradient-to-r from-white/20 to-transparent" />

                    <div className="space-y-4 pt-4">
                        {data.key_points.map((point, index) => {
                            const Icon = icons[index % icons.length];
                            return (
                                <div key={index} className="flex items-center gap-4 group/item">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition-transform group-hover/item:scale-110"
                                        style={{ color: index === 0 ? primaryColor : 'inherit' }}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-gray-300 font-medium">{point}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-auto space-y-6 text-center">
                    <div
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                        style={{ borderColor: `${primaryColor}33` }}
                    >
                        <p className="text-lg font-bold mb-2 italic">"{data.call_to_action}"</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                            Premium Service for {companyName}
                        </div>
                    </div>

                    <div className="text-[0.65rem] text-gray-600 uppercase tracking-[0.3em] font-bold">
                        Powered by MapKDev AI
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 p-8">
                <div className="w-20 h-20 rounded-full border border-white/5 opacity-50" />
            </div>
        </div>
    );
};

export default PosterPreview;
