export interface UserSession {
    id: string; // User ID (from the "user" object)
    email: string; // User email (from the "user" object)
    user_metadata: {
        avatar_url?: string; // Avatar URL from "user_metadata"
        full_name?: string; // Full name from "user_metadata"
        email_verified?: boolean; // Email verified status from "user_metadata"
    };
    provider_token: string; // Provider's token (from the response)
    provider_refresh_token: string; // Provider's refresh token (from the response)
    access_token: string; // Access token (from the response)
    expires_in: number; // Expiration time (in seconds)
    refresh_token: string; // Refresh token (from the response)
    token_type: string; // Token type (from the response)
    user: {
        id: string; // User's ID
        aud: string; // Audience (authenticated)
        role: string; // Role of the user (authenticated)
        email: string; // Email of the user
        email_confirmed_at: string; // Email confirmation timestamp
        phone: string; // Phone number (if available)
        confirmed_at: string; // Confirmation timestamp
        last_sign_in_at: string; // Last sign-in timestamp
        app_metadata: {
            provider: string; // Authentication provider (google)
            providers: string[]; // Array of providers used (e.g., google)
        };
        user_metadata: {
            avatar_url: string; // Avatar URL
            email: string; // User email
            email_verified: boolean; // Email verification status
            full_name: string; // Full name of the user
            iss: string; // Issuer (URL)
            name: string; // Name of the user
            phone_verified: boolean; // Phone verification status
            picture: string; // Profile picture URL
            provider_id: string; // Provider ID
            sub: string; // Subject ID for the provider
        };
        identities: Array<{
            identity_id: string; // Identity ID
            id: string; // Provider ID
            user_id: string; // User ID
            identity_data: {
                avatar_url: string;
                email: string;
                email_verified: boolean;
                full_name: string;
                iss: string;
                name: string;
                phone_verified: boolean;
                picture: string;
                provider_id: string;
                sub: string;
            };
            provider: string; // Provider name (google)
            last_sign_in_at: string; // Last sign-in timestamp
            created_at: string; // Creation timestamp
            updated_at: string; // Updated timestamp
            email: string; // Email of the identity
        }>;
        created_at: string; // Account creation timestamp
        updated_at: string; // Last update timestamp
        is_anonymous: boolean; // Is the user anonymous
    };
}

export interface AuthState {
    user: UserSession | null;
    isLoading: boolean;
    error: Error | null;
}