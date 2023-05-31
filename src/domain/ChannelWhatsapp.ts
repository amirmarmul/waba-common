export interface ProviderConfig {
  accessToken?: string;
  client?: string;
  expiry?: string;
  uid?: string;
  wabaId?: string;
  version?: string;
  phoneNumberId?: string;
}

export interface ChannelWhatsapp {
  _id?: string;
  accountId: string;
  account?: any;
  phone: string;
  provider?: string;
  providerConfig?: ProviderConfig;
}

export default ChannelWhatsapp;
