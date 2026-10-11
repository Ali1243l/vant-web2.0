import type { EmailCampaignData } from '../WelcomeEmailTemplate';

export type TabType = 'directory' | 'studio' | 'history';

export interface SentCampaignRecord {
  id: string;
  name: string;
  subject: string;
  templateType: EmailCampaignData['templateType'];
  sentDate: string;
  recipientsCount: number;
  openRate: number;
  clickRate: number;
  status: 'delivered' | 'sending' | 'failed';
  channel: 'resend' | 'mailto' | 'simulation';
  campaignData: EmailCampaignData;
}
