
import { useEffect } from "react";
import { toast } from "sonner";

export const useGlobalToastConfig = () => {
  useEffect(() => {
    // Configure global toast settings
    const originalToastSuccess = toast.success;
    const originalToastError = toast.error;

    toast.success = (message: string) => {
      return originalToastSuccess(message, {
        duration: 5000,
        position: "bottom-right",
      });
    };

    toast.error = (message: string) => {
      return originalToastError(message, {
        duration: 5000,
        position: "bottom-right",
      });
    };

    return () => {
      // Restore original functions on cleanup
      toast.success = originalToastSuccess;
      toast.error = originalToastError;
    };
  }, []);
};

export default useGlobalToastConfig;
