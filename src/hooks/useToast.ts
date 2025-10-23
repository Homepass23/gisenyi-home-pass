import { toast, ToastT } from 'sonner';

// Custom hook for toast notifications
export const useToast = () => {
  const showSuccess = (message: string, options?: Partial<ToastT>) => {
    toast.success(message, options);
  };

  const showError = (message: string, options?: Partial<ToastT>) => {
    toast.error(message, options);
  };

  const showWarning = (message: string, options?: Partial<ToastT>) => {
    toast.warning(message, options);
  };

  const showInfo = (message: string, options?: Partial<ToastT>) => {
    toast.info(message, options);
  };

  const showPromise = <T, E = Error>(
    promise: Promise<T>, 
    options?: Partial<ToastT> & { 
      loading?: string;
      success?: (data: T) => string;
      error?: (error: E) => string;
    }
  ) => {
    toast.promise(promise, options);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPromise
  };
};