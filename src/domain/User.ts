export enum RoleEnum {
  Admin = 'admin',
  Finance = 'finance',
  Operational = 'operational',
  Member = 'member',
}

export enum StatusEnum {
  Active = 'active',
  Archived = 'archived',
}

export enum ProviderEnum {
  Email = 'email',
}

interface User {
  id?: string;
  provider: ProviderEnum;
  uid: string;
  password: string | undefined;
  name: string;
  email: string;
  accountId: string | undefined;
  token: string | undefined;
  status: StatusEnum,
}

export default User;
