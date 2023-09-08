export interface Report {
  accountId: string;
  params: ReportParams;
  status: string;
  file?: string;
}

export interface ReportParams {
  dateSince: Date;
  dateUntil: Date;
  accountId?: string;
  senderId?: string;
  userId?: string;
  type?: string;
}

export enum ReportStatus {
  Created = 'created',
  Completed = 'completed',
  Empty = 'empty',
  Failed = 'failed'
}