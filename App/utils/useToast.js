import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast notifications
 *
 * Usage:
 * const { toast, showToast, ToastComponent } = useToast();
 *
 * showToast('Your message here', 'success', 3000);
 *
 * // In your JSX:
 * <ToastComponent />
 */
const useToast = () => {
    const [toast, setToast] = useState({
        visible: false,
        message: '',
        type: 'success',
        duration: 2000,
    });

    const showToast = useCallback((message, type = 'success', duration = 2000) => {
        setToast({
            visible: true,
            message,
            type,
            duration,
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }));
    }, []);

    return {
        toast,
        showToast,
        hideToast,
    };
};

export default useToast;