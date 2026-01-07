export interface LeadAnalysis {
    tech_stack: string[];
    ux_assessment?: string;
    mobile_friendly?: boolean;
    business_insight?: string;
    ai_confidence?: number;
}

export interface Lead {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    contact_email?: string;
    rating?: number;
    ai_score?: number;
    ai_grade?: string;
    ai_status: 'pending' | 'analyzing' | 'completed' | 'failed';
    ai_tags: string[];
    status: 'pending' | 'analyzed' | 'contacted' | 'ignored';
    created_at: string;
    analysis?: LeadAnalysis;
}

export interface SearchParams {
    query: string;
    location?: string;
}
