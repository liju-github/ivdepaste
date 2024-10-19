export interface Paste {
    id: string;
    title: string;
    content: string;
    user_id?: string;
    created_at: string;
    expires_at?: string;
    visibility: 'public' | 'private';
    language: string;
}

export interface HomePageProps {
    toggle: boolean;
}