"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Switch,
  Alert,
  Space,
  Typography,
  Divider,
  Badge,
  message,
} from "antd";
import {
  BellOutlined,
  NotificationOutlined,
  SendOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useNotification } from "../hooks/useNotification";

const { Title, Text, Paragraph } = Typography;

interface NotificationManagerProps {
  className?: string;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
  className,
}) => {
  const {
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
    startAutoSend,
    stopAutoSend,
  } = useNotification();

  const [isSendingTest, setIsSendingTest] = useState(false);

  // Handle subscription toggle
  const handleSubscriptionToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await subscribe();
        message.success("اشتراک نوتیفیکیشن فعال شد! 🎉");
      } else {
        await unsubscribe();
        message.success("اشتراک نوتیفیکیشن غیرفعال شد");
      }
    } catch {
      message.error("خطا در تغییر وضعیت اشتراک");
    }
  };

  // Handle test notification
  const handleTestNotification = async () => {
    try {
      setIsSendingTest(true);
      await sendTestNotification({
        title: "تست کلاسکو 🎓",
        body: `پیام تست ارسال شد! - ${new Date().toLocaleTimeString("fa-IR")}`,
        url: "/class",
      });
      message.success("نوتیفیکیشن تست ارسال شد!");
    } catch {
      message.error("خطا در ارسال نوتیفیکیشن تست");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Handle permission request
  const handleRequestPermission = async () => {
    try {
      const newPermission = await requestPermission();
      if (newPermission === "granted") {
        message.success("مجوز نوتیفیکیشن دریافت شد!");
      } else {
        message.warning("مجوز نوتیفیکیشن رد شد");
      }
    } catch {
      message.error("خطا در درخواست مجوز");
    }
  };

  // Get permission status info
  const getPermissionInfo = () => {
    switch (permission) {
      case "granted":
        return {
          type: "success" as const,
          message: "مجوز نوتیفیکیشن فعال است",
          icon: <CheckCircleOutlined />,
        };
      case "denied":
        return {
          type: "error" as const,
          message: "مجوز نوتیفیکیشن رد شده است",
          icon: <ExclamationCircleOutlined />,
        };
      default:
        return {
          type: "info" as const,
          message: "مجوز نوتیفیکیشن هنوز تعیین نشده",
          icon: <InfoCircleOutlined />,
        };
    }
  };

  const permissionInfo = getPermissionInfo();

  if (!isSupported) {
    return (
      <Card className={className} title="مدیریت نوتیفیکیشن">
        <Alert
          message="عدم پشتیبانی"
          description="مرورگر شما از نوتیفیکیشن پشتیبانی نمی‌کند"
          type="warning"
          icon={<ExclamationCircleOutlined />}
        />
      </Card>
    );
  }

  return (
    <Card
      className={className}
      title={
        <Space>
          <BellOutlined />
          مدیریت نوتیفیکیشن
          {isSubscribed && <Badge status="success" />}
        </Space>
      }
      extra={<SettingOutlined />}
      loading={isLoading}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Status Alert */}
        {error && (
          <Alert
            message="خطا"
            description={error}
            type="error"
            closable
            icon={<ExclamationCircleOutlined />}
          />
        )}

        {/* Permission Status */}
        <div>
          <Title level={5}>وضعیت مجوز</Title>
          <Alert
            message={permissionInfo.message}
            type={permissionInfo.type}
            icon={permissionInfo.icon}
            action={
              permission !== "granted" && (
                <Button
                  size="small"
                  type="primary"
                  onClick={handleRequestPermission}
                  loading={isLoading}
                >
                  درخواست مجوز
                </Button>
              )
            }
          />
        </div>

        <Divider />

        {/* Subscription Toggle */}
        <div>
          <Title level={5}>اشتراک نوتیفیکیشن</Title>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <NotificationOutlined />
                <Text>دریافت نوتیفیکیشن</Text>
              </Space>
              <Switch
                checked={isSubscribed}
                onChange={handleSubscriptionToggle}
                disabled={permission !== "granted" || isLoading}
                loading={isLoading}
              />
            </div>

            {isSubscribed && subscription && (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Endpoint: {subscription.endpoint.substring(0, 50)}...
              </Text>
            )}
          </Space>
        </div>

        <Divider />

        {/* Auto-Send Notifications */}
        <div>
          <Title level={5}>
            <Space>
              <ThunderboltOutlined />
              ارسال خودکار (هر 10 ثانیه)
              {isAutoSending && <Badge status="processing" />}
            </Space>
          </Title>
          <Paragraph type="secondary">
            پس از فعال کردن، هر 10 ثانیه نوتیفیکیشن ارسال می‌شود
          </Paragraph>

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                {isAutoSending ? (
                  <PauseCircleOutlined style={{ color: "#ff4d4f" }} />
                ) : (
                  <PlayCircleOutlined style={{ color: "#52c41a" }} />
                )}
                <Text>{isAutoSending ? "در حال ارسال..." : "آماده شروع"}</Text>
              </Space>

              {isAutoSending ? (
                <Button
                  danger
                  icon={<PauseCircleOutlined />}
                  onClick={stopAutoSend}
                  size="large"
                >
                  توقف
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={startAutoSend}
                  disabled={!isSubscribed || permission !== "granted"}
                  size="large"
                >
                  شروع ارسال خودکار
                </Button>
              )}
            </div>

            {/* نمایش آمار ارسال */}
            {isAutoSending && (
              <Alert
                message={`🚀 تعداد ارسال شده: ${autoSendCount} نوتیفیکیشن`}
                description="نوتیفیکیشن بعدی تا 10 ثانیه دیگر ارسال خواهد شد"
                type="info"
                showIcon
                icon={<ThunderboltOutlined />}
              />
            )}
          </Space>
        </div>

        <Divider />

        {/* Test Notification */}
        <div>
          <Title level={5}>تست دستی</Title>
          <Paragraph type="secondary">برای تست تکی سیستم نوتیفیکیشن</Paragraph>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleTestNotification}
            disabled={!isSubscribed || permission !== "granted"}
            loading={isSendingTest}
            size="large"
          >
            ارسال نوتیفیکیشن تست
          </Button>
        </div>

        {/* Stats */}
        {isSubscribed && (
          <>
            <Divider />
            <div>
              <Title level={5}>آمار کلی</Title>
              <Space direction="vertical" size="small">
                <Text>
                  <Badge status="success" />
                  وضعیت اشتراک: فعال
                </Text>
                <Text>
                  <Badge status={isAutoSending ? "processing" : "default"} />
                  ارسال خودکار:{" "}
                  {isAutoSending ? `فعال (${autoSendCount} ارسال)` : "غیرفعال"}
                </Text>
                <Text type="secondary">مجوز: {permission}</Text>
                <Text type="secondary">
                  پشتیبانی مرورگر: {isSupported ? "بله" : "خیر"}
                </Text>
                {isAutoSending && (
                  <Text type="success">⏰ بعدی در 10 ثانیه آینده</Text>
                )}
              </Space>
            </div>
          </>
        )}
      </Space>
    </Card>
  );
};

export default NotificationManager;
