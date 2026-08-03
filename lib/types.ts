export interface LeadAnalysis {
    id?: number;
    lead_id?: number;
    tech_stack: string[];
    ux_assessment?: string;
    mobile_friendly?: boolean;
    business_insight?: string;
    detailed_analysis?: string;
    ai_confidence?: number;
    generated_email?: string;
    email_subjects?: string[];
    poster_description?: string;
    poster_url?: string;
}

export interface Lead {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    contact_email?: string;
    rating?: number;
    place_id?: string;
    search_query?: string;
    search_location?: string;
    industry?: string;
    ai_score?: number;
    ai_grade?: string;
    ai_status: 'pending' | 'analyzing' | 'completed' | 'failed' | string;
    ai_tags: string[];
    status: 'pending' | 'analyzed' | 'contacted' | 'ignored' | string;
    contact_attempts?: number;
    last_contacted?: string;
    created_at?: string;
    updated_at?: string;
    analysis?: LeadAnalysis;
}

export interface SearchParams {
    query: string;
    location?: string;
}
