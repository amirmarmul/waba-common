export interface Report {
  accountId: string;
  params: ReportParams;
  status: string;
  file?: string;
}

export interface ReportParams {
  transactionDate?: ParamsDate;
  createdDate?: ParamsDate,
  sentDate?: ParamsDate,
  deliveryReportDate?: ParamsDate,
  area?: string,
  customerId?: string,
  senderId?: string;
  creatorId?: string,
  senderName?: string,
  vendor?: string,
  operator?: string,
  productName?: string,
  category?: string,
  status?: string,
  type?: string,
}

export class ParamsDate {
  dateSince: Date;
  dateUntil: Date;
}

export enum ReportStatus {
  Created = 'created',
  Completed = 'completed',
  Empty = 'empty',
  Failed = 'failed'
}