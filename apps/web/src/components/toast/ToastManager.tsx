import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { toast, type ToastOptions } from "../../services/toast.service";
import Toast from "./Toast.tsx";
import { T } from "../../theme/tokens";

interface ToastItem extends ToastOptions {
  id: string;
}

// Fallback UUID generator for environments where crypto.randomUUID is not available
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: simple UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ToastManager = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);

  const toastCallback = useCallback((options: ToastOptions) => {
    const id = generateUUID();
    console.log("ToastManager: Showing toast", options);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  useEffect(() => {
    console.log("ToastManager: Registering toast callback");

    // Register the toast callback
    toast.register(toastCallback);
    setIsRegistered(true);

    // Clean up function
    return () => {
      console.log("ToastManager: Unregistering toast callback");
      toast.unregister(toastCallback);
      setIsRegistered(false);
    };
  }, [toastCallback]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {isRegistered && (
        <Container>
          {toasts.map((toastItem) => (
            <Toast
              key={toastItem.id}
              message={toastItem.message}
              type={toastItem.type ?? "info"}
              duration={typeof toastItem.duration === "string" ? 3000 : (toastItem.duration ?? 3000)}
              onClose={() => removeToast(toastItem.id)}
            />
          ))}
        </Container>
      )}
    </>
  );
};

export default ToastManager;

const Container = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: ${T.zToast};
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  padding: 0 max(16px, env(safe-area-inset-right, 0px));

  & > * {
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    top: max(16px, env(safe-area-inset-top, 0px));
    left: 16px;
    right: 16px;
    align-items: stretch;
  }
`;
