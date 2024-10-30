export interface Paste {
    id: string;
    title: string;
    content: string;
    userId?: string;
    burn: boolean;
    createdAt: string;  
    expiresAt: string | null;  
    localLanguage: string;  
    programmingLanguage: string;  
}

export interface HomePageProps {
    toggle?: boolean;
}

export const colorThemes = [
    "default",
    "dark",
    "serika-dark",
    "botanical",
    "carbon",
    "aurora",
    "nebula",
    "copper",
    "beach-sand",
    "tropical-ocean",
    "sunset-warmth"
];

export const applicationName = "application"