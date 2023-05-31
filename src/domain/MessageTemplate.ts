export enum MessageTemplateStatus {
  Draft = 'draft',
  Scheduled = 'scheduled',
  Published = 'published',
  Approved = 'approved',
  Declined = 'declined',
  Failed = 'failed',
}

export interface MessageTemplate {
  _id?: string;
  name: string;
  payload: any;
  status: MessageTemplateStatus;
  createdAt: any;
  updatedAt: any;
  senderId?: any;
  sourceId?: string;
  sourceStatus?: string;
  sourceReason?: string;
  accountId: any;
  notes?: any;
  sentAt?: Date,
}

export default MessageTemplate;
