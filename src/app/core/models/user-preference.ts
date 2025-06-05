export interface UserPreferences {
    pageSize?: number;
}

// Default preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    pageSize: 5
};