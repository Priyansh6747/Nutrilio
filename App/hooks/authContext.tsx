// contexts/UserContext.tsx
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define the context value type
interface UserContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isEmailVerified: boolean;
    hasDisplayName: boolean;
    updateUser: (updatedUser: User | null) => void;
    logout: () => void;
    // Derived states for routing guards
    canAccessTabs: boolean;
    canAccessOnboarding: boolean;
    canAccessVerifyEmail: boolean;
    shouldShowSignin: boolean;
}

// Create the context with undefined as default (will be checked in useUser)
const UserContext = createContext<UserContextValue | undefined>(undefined);

// Custom hook to use the UserContext
export const useUser = (): UserContextValue => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// Props type for the provider
interface UserProviderProps {
    children: ReactNode;
}

// Provider component
export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    const [hasDisplayName, setHasDisplayName] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            console.log('Auth state changed:', {
                user: user ? { email: user.email, emailVerified: user.emailVerified, displayName: user.displayName } : null,
                isAuthenticated: !!user,
                isEmailVerified: user ? user.emailVerified : false,
                hasDisplayName: user ? !!user.displayName : false
            });
            
            setUser(user);
            setIsAuthenticated(!!user);
            setIsEmailVerified(user ? user.emailVerified : false);
            setHasDisplayName(user ? !!user.displayName : false);
            setIsLoading(false);
        });

        return unsubscribe; // Clean up subscription
    }, []);

    // Helper functions
    const updateUser = (updatedUser: User | null): void => {
        console.log('Updating user in context:', {
            user: updatedUser ? { email: updatedUser.email, emailVerified: updatedUser.emailVerified, displayName: updatedUser.displayName } : null
        });
        
        setUser(updatedUser);
        setIsAuthenticated(!!updatedUser);
        setIsEmailVerified(updatedUser ? updatedUser.emailVerified : false);
        setHasDisplayName(updatedUser ? !!updatedUser.displayName : false);
    };

    const logout = (): void => {
        setUser(null);
        setIsAuthenticated(false);
        setIsEmailVerified(false);
        setHasDisplayName(false);
    };

    const value: UserContextValue = {
        user,
        isLoading,
        isAuthenticated,
        isEmailVerified,
        hasDisplayName,
        updateUser,
        logout,
        // Derived states for routing guards
        canAccessTabs: isAuthenticated && isEmailVerified && hasDisplayName,
        canAccessOnboarding: isAuthenticated && isEmailVerified,
        canAccessVerifyEmail: isAuthenticated,
        shouldShowSignin: !isAuthenticated,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};