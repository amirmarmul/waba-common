export enum PaymentType {
  Credit = 'credit',
  Debit = 'debit',
}

export interface Payment {
  account: string;
  amount: number;
  resource: string;
  resourceName: string;
  type: PaymentType;
}

export default Payment;
