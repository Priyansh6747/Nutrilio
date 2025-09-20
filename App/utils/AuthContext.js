// contexts/UserContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Create the context
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [hasDisplayName, setHasDisplayName] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsAuthenticated(!!user);
            setIsEmailVerified(user ? user.emailVerified : false);
            setHasDisplayName(user ? !!user.displayName : false);
            setIsLoading(false);
        });

        return unsubscribe; // Clean up subscription
    }, []);

    // Helper functions
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        setIsAuthenticated(!!updatedUser);
        setIsEmailVerified(updatedUser ? updatedUser.emailVerified : false);
        setHasDisplayName(updatedUser ? !!updatedUser.displayName : false);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setIsEmailVerified(false);
        setHasDisplayName(false);
    };

    const value = {
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
