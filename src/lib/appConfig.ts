export interface BusinessConfig {
  businessName: string;
  ownerName: string;
  whatsappBrand: string;
  currency: 'USD' | 'CUP';
  onboardingCompleted: boolean;
  createdAt: string;
}

export const DEFAULT_CONFIG: BusinessConfig = {
  businessName: '',
  ownerName: '',
  whatsappBrand: '',
  currency: 'USD',
  onboardingCompleted: false,
  createdAt: '',
};