import toast from 'react-hot-toast';

// Success toast
export const showSuccess = (message: string) => {
    toast.success(message);
};

// Error toast
export const showError = (message: string) => {
    toast.error(message);
};

// Info toast
export const showInfo = (message: string) => {
    toast(message);
};

// Loading toast that can be updated with success or error
export const showLoadingToast = (loadingMessage: string) => {
    return toast.loading(loadingMessage, {
        id: `loading-${Date.now()}`,
    });
};

// Update a loading toast with success
export const updateToastSuccess = (toastId: string, message: string) => {
    toast.success(message, {
        id: toastId,
    });
};

// Update a loading toast with error
export const updateToastError = (toastId: string, message: string) => {
    toast.error(message, {
        id: toastId,
    });
};

// Dismiss a specific toast
export const dismissToast = (toastId: string) => {
    toast.dismiss(toastId);
};

// Custom validation error toast with field-specific errors
export const showValidationErrors = (errors: Record<string, string[]>) => {
    const errorMessage = Object.entries(errors)
        .map(([field, messages]) => {
            return `${field}: ${messages.join(', ')}`;
        })
        .join('\n');

    toast.error(errorMessage, {
        duration: 6000,
        style: {
            maxWidth: '500px',
            padding: '16px',
        },
    });
}; 