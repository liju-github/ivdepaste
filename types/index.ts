export interface Paste {
    id: string;
    title: string;
    content: string;
    user_id?: string;
    burn: Boolean;
    created_at: string;
    expires_at?: string;
    visibility: 'public' | 'private';
    language: string;
}

export interface HomePageProps {
    toggle?: boolean;
}


