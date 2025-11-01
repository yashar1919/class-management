'use client';

import React, { useState } from 'react';
import { Card, Button, Switch, Alert, Space, Typography, Divider, Badge, message } from 'antd';
import { 
  BellOutlined, 
  NotificationOutlined, 
  SendOutlined, 
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNotification } from '../hooks/useNotification';

const { Title, Text, Paragraph } = Typography;

interface NotificationManagerProps {
  className?: string;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ className }) => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscription,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
    requestPermission
  } = useNotification();

  const [isSendingTest, setIsSendingTest] = useState(false);

  // Handle subscription toggle
  const handleSubscriptionToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await subscribe();
        message.success('اشتراک نوتیفیکیشن فعال شد! 🎉');
      } else {
        await unsubscribe();
        message.success('اشتراک نوتیفیکیشن غیرفعال شد');
      }
    } catch {
      message.error('خطا در تغییر وضعیت اشتراک');
    }
  };

  // Handle test notification
  const handleTestNotification = async () => {
    try {
      setIsSendingTest(true);
      await sendTestNotification({
        title: 'تست کلاسکو 🎓',
        body: `پیام تست ارسال شد! - ${new Date().toLocaleTimeString('fa-IR')}`,
        url: '/class'
      });
      message.success('نوتیفیکیشن تست ارسال شد!');
    } catch {
      message.error('خطا در ارسال نوتیفیکیشن تست');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Handle permission request
  const handleRequestPermission = async () => {
    try {
      const newPermission = await requestPermission();
      if (newPermission === 'granted') {
        message.success('مجوز نوتیفیکیشن دریافت شد!');
      } else {
        message.warning('مجوز نوتیفیکیشن رد شد');
      }
    } catch {
      message.error('خطا در درخواست مجوز');
    }
  };

  // Get permission status info
  const getPermissionInfo = () => {
    switch (permission) {
      case 'granted':
        return {
          type: 'success' as const,
          message: 'مجوز نوتیفیکیشن فعال است',
          icon: <CheckCircleOutlined />
        };
      case 'denied':
        return {
          type: 'error' as const,
          message: 'مجوز نوتیفیکیشن رد شده است',
          icon: <ExclamationCircleOutlined />
        };
      default:
        return {
          type: 'info' as const,
          message: 'مجوز نوتیفیکیشن هنوز تعیین نشده',
          icon: <InfoCircleOutlined />
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
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
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
              permission !== 'granted' && (
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
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <NotificationOutlined />
                <Text>دریافت نوتیفیکیشن</Text>
              </Space>
              <Switch
                checked={isSubscribed}
                onChange={handleSubscriptionToggle}
                disabled={permission !== 'granted' || isLoading}
                loading={isLoading}
              />
            </div>
            
            {isSubscribed && subscription && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Endpoint: {subscription.endpoint.substring(0, 50)}...
              </Text>
            )}
          </Space>
        </div>

        <Divider />

        {/* Test Notification */}
        <div>
          <Title level={5}>تست نوتیفیکیشن</Title>
          <Paragraph type="secondary">
            برای تست سیستم نوتیفیکیشن، روی دکمه زیر کلیک کنید
          </Paragraph>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleTestNotification}
            disabled={!isSubscribed || permission !== 'granted'}
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
              <Title level={5}>آمار</Title>
              <Space direction="vertical">
                <Text>
                  <Badge status="success" />
                  وضعیت: فعال
                </Text>
                <Text type="secondary">
                  مجوز: {permission}
                </Text>
                <Text type="secondary">
                  پشتیبانی مرورگر: {isSupported ? 'بله' : 'خیر'}
                </Text>
              </Space>
            </div>
          </>
        )}

      </Space>
    </Card>
  );
};

export default NotificationManager;