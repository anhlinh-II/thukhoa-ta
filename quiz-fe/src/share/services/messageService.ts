import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';

class MessageService {
  private messageApi: MessageInstance | null = null;
  private notificationApi: NotificationInstance | null = null;

  setMessageApi(api: MessageInstance) {
    this.messageApi = api;
  }

  setNotificationApi(api: NotificationInstance) {
    this.notificationApi = api;
  }

  success(content: string, duration = 3) {
    this.messageApi?.success(content, duration);
  }

  error(content: string, duration = 4) {
    this.messageApi?.error(content, duration);
  }

  warning(content: string, duration = 3) {
    this.messageApi?.warning(content, duration);
  }

  info(content: string, duration = 3) {
    this.messageApi?.info(content, duration);
  }

  open(config: { type: 'success' | 'error' | 'warning' | 'info'; content: string; duration?: number }) {
    this.messageApi?.open(config);
  }

  notify(config: { message: string; description?: string; type?: 'success' | 'error' | 'warning' | 'info' }) {
    const { type = 'info', ...rest } = config;
    this.notificationApi?.[type](rest);
  }

  notifyInfo(message: string, description?: string) {
    this.notificationApi?.info({ message, description });
  }

  notifySuccess(message: string, description?: string) {
    this.notificationApi?.success({ message, description });
  }

  notifyError(message: string, description?: string) {
    this.notificationApi?.error({ message, description });
  }
}

const messageService = new MessageService();
export default messageService;
