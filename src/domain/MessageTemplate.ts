export enum MessageTemplateStatus {
  Draft = 'draft',
  Published = 'published',
  Approved = 'approved',
  Declined = 'declined',
}

export interface MessageTemplate {
  _id?: string;
  name: string;
  payload: any;
  status: MessageTemplateStatus;
  createdAt: any;
  updatedAt: any;
  sender?: any;
  sourceId?: string;
  sourceStatus?: string;
  sourceReason?: string;
  account: any;
  notes?: any;
}

export default MessageTemplate;
