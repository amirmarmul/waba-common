export enum PaymentType {
  Credit = 'credit',
  Debit = 'debit',
}

export interface Payment {
  accountId: string;
  account?: any;
  amount: number;
  resource?: string;
  resourceName?: string;
  type: PaymentType;
  notes: string;
}

export default Payment;
