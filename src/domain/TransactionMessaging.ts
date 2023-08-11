export enum TransactionMessagingStatus {
  Created = 'created',
  Paid = 'paid',
  Published = 'published',
  Succeeded = 'succeeded',
  Failed = 'failed',
}

export interface TransactionMessaging {
  _id?: string,
  accountId: any;
  account?: any;
  campaignId: any;
  campaign?: any;
  sku: string;
  amount: number;
  msisdn: any;
  status: TransactionMessagingStatus;
  schedule: boolean;
  scheduleAt?: Date,
  scheduleZone?: string;
  notes?: any;
  productId?: string;
  product?: any;
  content?: any;
  payment?: any;
  senderId?: string;
  sender?: any;
  sourceId?: string;
  sourceStatus?: string;
  sourceReason?: string;
  sentAt?: Date,
}

export default TransactionMessaging;
