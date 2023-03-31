export enum TransactionMessagingStatus {
  Created = 'created',
  Paid = 'paid',
  Published = 'published',
  Succeeded = 'succeeded',
  Failed = 'failed',
}

export interface TransactionMessaging {
  _id?: string,
  account: any;
  campaign: any;
  sku: string;
  amount: number;
  msisdn: any;
  status: TransactionMessagingStatus;
  schedule: boolean;
  scheduleAt?: Date,
  scheduleZone?: string;
  notes?: any;
  product?: any;
  content?: any;
  payment?: any;
  sender?: any;
  sourceId?: string;
  sourceStatus?: string;
  sourceReason?: string;
}

export default TransactionMessaging;
