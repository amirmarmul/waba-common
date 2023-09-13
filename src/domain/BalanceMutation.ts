export enum BalanceMutationType {
  Credit = 'credit',
  Debit = 'debit',
}

export interface BalanceMutation {
  accountId: string;
  account?: any;
  creatorId?: string;
  creatorName?: string;
  amount: number;
  resource: string;
  resourceName: string;
  type: BalanceMutationType;
  notes: string;
  before?: number;
  after?: number;
}

export default BalanceMutation;
