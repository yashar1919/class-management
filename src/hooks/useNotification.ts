"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  isAutoSending: boolean;
  autoSendCount: number;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: (data?: Partial<NotificationData>) => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
  checkSubscription: () => Promise<void>;
  startAutoSend: () => void;
  stopAutoSend: () => void;
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
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [autoSendCount, setAutoSendCount] = useState(0);

  // Refs برای interval ID و count
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef(0);

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

  // Start auto-send notifications every 10 seconds
  const startAutoSend = useCallback(() => {
    if (intervalRef.current || !isSubscribed || permission !== "granted") {
      return;
    }

    setIsAutoSending(true);
    setAutoSendCount(0);
    countRef.current = 0;

    // ارسال اولیه
    sendTestNotification({
      title: "🔥 کلاسکو - خودکار",
      body: `ارسال خودکار شروع شد - ${new Date().toLocaleTimeString("fa-IR")}`,
      requireInteraction: false,
    }).catch(console.error);

    // تنظیم interval برای هر 10 ثانیه
    intervalRef.current = setInterval(async () => {
      try {
        countRef.current += 1;
        const currentCount = countRef.current;

        setAutoSendCount(currentCount);

        // ارسال نوتیفیکیشن
        await sendTestNotification({
          title: `🎓 کلاسکو #${currentCount}`,
          body: `پیام خودکار ${currentCount} - ${new Date().toLocaleTimeString("fa-IR")}`,
          url: "/class",
          requireInteraction: false,
          vibrate: [100, 50, 100],
        });
      } catch (error) {
        console.error("[Auto-send] Error:", error);
      }
    }, 10000); // 10 ثانیه

    console.log("🚀 Auto-send notifications started (every 10 seconds)");
  }, [isSubscribed, permission, sendTestNotification]);

  // Stop auto-send notifications
  const stopAutoSend = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsAutoSending(false);
      countRef.current = 0;
      setAutoSendCount(0);
      console.log("⏹️ Auto-send notifications stopped");
    }
  }, []);

  // Cleanup interval on unmount or when subscription changes
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Save auto-send preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("classco-auto-send", isAutoSending.toString());
    }
  }, [isAutoSending]);

  // Auto-start when user subscribes (based on saved preference)
  useEffect(() => {
    if (isSubscribed && permission === "granted" && !isAutoSending) {
      // چک کردن تنظیمات ذخیره شده
      const savedPreference =
        typeof window !== "undefined"
          ? localStorage.getItem("classco-auto-send") === "true"
          : true; // default true

      if (savedPreference) {
        // شروع خودکار بعد از 2 ثانیه
        const timeout = setTimeout(() => {
          startAutoSend();
        }, 2000);

        return () => clearTimeout(timeout);
      }
    } else if (!isSubscribed && isAutoSending) {
      stopAutoSend();
    }
  }, [isSubscribed, permission, isAutoSending, startAutoSend, stopAutoSend]);

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
    isAutoSending,
    autoSendCount,
    subscribe,
    unsubscribe,
    sendTestNotification,
    requestPermission,
    checkSubscription,
    startAutoSend,
    stopAutoSend,
  };
};
