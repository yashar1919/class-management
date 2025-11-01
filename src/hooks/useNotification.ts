"use client";

import { useState, useEffect, useCallback } from "react";
import NotificationService, {
  NotificationData,
  PushSubscriptionData,
} from "../services/notificationService";

export interface UseNotificationReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  subscription: PushSubscriptionData | null;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: (data?: Partial<NotificationData>) => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
  checkSubscription: () => Promise<void>;
}

export const useNotification = (): UseNotificationReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    try {
      const service = NotificationService.getInstance();
      const currentSubscription = await service.getSubscription();
      setSubscription(currentSubscription);
      setIsSubscribed(!!currentSubscription);
    } catch (err) {
      console.error("[useNotification] Check subscription error:", err);
      setIsSubscribed(false);
      setSubscription(null);
    }
  }, []);

  // Subscribe to notifications
  const subscribe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const service = NotificationService.getInstance();
      const subscriptionData = await service.subscribe();
      setSubscription(subscriptionData);
      setIsSubscribed(!!subscriptionData);
      setPermission("granted");
    } catch (err) {
      console.error("[useNotification] Subscribe error:", err);
      setError(err instanceof Error ? err.message : "Failed to subscribe");
      setIsSubscribed(false);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Unsubscribe from notifications
  const unsubscribe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const service = NotificationService.getInstance();
      await service.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);
    } catch (err) {
      console.error("[useNotification] Unsubscribe error:", err);
      setError(err instanceof Error ? err.message : "Failed to unsubscribe");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(
    async (data?: Partial<NotificationData>) => {
      try {
        setError(null);
        const service = NotificationService.getInstance();
        const testData: NotificationData = {
          title: "تست کلاسکو 🎓",
          body: `پیام تست - ${new Date().toLocaleTimeString("fa-IR")}`,
          icon: "/icon512_rounded.png",
          badge: "/icon512_maskable.png",
          url: "/class",
          requireInteraction: true,
          vibrate: [200, 100, 200],
          ...data,
        };
        await service.sendTestNotification(testData);
      } catch (err) {
        console.error("[useNotification] Send test error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to send test notification"
        );
        throw err;
      }
    },
    []
  );

  // Request permission
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      try {
        setError(null);
        const service = NotificationService.getInstance();
        const newPermission = await service.requestPermission();
        setPermission(newPermission);
        return newPermission;
      } catch (err) {
        console.error("[useNotification] Request permission error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to request permission"
        );
        throw err;
      }
    }, []);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const service = NotificationService.getInstance();

        const supported = service.isNotificationSupported();
        setIsSupported(supported);

        if (!supported) {
          setError("Push notifications are not supported in this browser");
          return;
        }

        await service.initialize();
        const currentPermission = service.getPermissionStatus();
        setPermission(currentPermission);
        await checkSubscription();
      } catch (err) {
        console.error("[useNotification] Initialize error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize notifications"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [checkSubscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscription,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
    requestPermission,
    checkSubscription,
  };
};
