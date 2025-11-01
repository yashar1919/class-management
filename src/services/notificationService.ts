// Notification Service for Classco PWA
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private isSupported: boolean = false;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.checkSupport();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkSupport(): void {
    this.isSupported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    console.log("[NotificationService] Support check:", {
      serviceWorker: "serviceWorker" in navigator,
      pushManager: "PushManager" in window,
      notification: "Notification" in window,
      isSupported: this.isSupported,
    });
  }

  public async initialize(): Promise<void> {
    if (!this.isSupported) {
      throw new Error("Push notifications are not supported in this browser");
    }

    try {
      // Register Service Worker
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log(
        "[NotificationService] Service Worker registered:",
        this.registration
      );

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      console.log("[NotificationService] Service Worker ready");

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener(
        "message",
        this.handleServiceWorkerMessage
      );
    } catch (error) {
      console.error(
        "[NotificationService] Failed to register service worker:",
        error
      );
      throw error;
    }
  }

  private handleServiceWorkerMessage = (event: MessageEvent) => {
    console.log("[NotificationService] Message from SW:", event.data);
  };

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error("Notifications are not supported");
    }

    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    console.log("[NotificationService] Permission status:", permission);
    return permission;
  }

  public async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      throw new Error("Service worker not registered");
    }

    const permission = await this.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    try {
      // Get VAPID public key from API
      const response = await fetch("/api/notifications/vapid-key");
      const { publicKey } = await response.json();

      if (!publicKey) {
        throw new Error("VAPID public key not found");
      }

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          publicKey
        ) as BufferSource,
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
      };

      // Send subscription to server
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionData),
      });

      console.log(
        "[NotificationService] Successfully subscribed:",
        subscriptionData
      );
      return subscriptionData;
    } catch (error) {
      console.error("[NotificationService] Subscription failed:", error);
      throw error;
    }
  }

  public async unsubscribe(): Promise<void> {
    if (!this.registration) {
      throw new Error("Service worker not registered");
    }

    try {
      const subscription =
        await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // Notify server about unsubscription
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        console.log("[NotificationService] Successfully unsubscribed");
      }
    } catch (error) {
      console.error("[NotificationService] Unsubscription failed:", error);
      throw error;
    }
  }

  public async getSubscription(): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      return null;
    }

    try {
      const subscription =
        await this.registration.pushManager.getSubscription();
      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
      };
    } catch (error) {
      console.error("[NotificationService] Failed to get subscription:", error);
      return null;
    }
  }

  public async sendTestNotification(data: NotificationData): Promise<void> {
    try {
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("[NotificationService] Test notification sent:", data);
    } catch (error) {
      console.error(
        "[NotificationService] Failed to send test notification:",
        error
      );
      throw error;
    }
  }

  public isNotificationSupported(): boolean {
    return this.isSupported;
  }

  public getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  }
}

export default NotificationService;
