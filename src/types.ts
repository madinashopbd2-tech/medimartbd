export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ProductData {
  id: string;
  title: string;
  subtitle: string;
  regularPrice: number;
  offerPrice: number;
  deliveryInside: number;
  deliveryOutside: number;
  stockQuantity: number;
  isStockActive: boolean;
  sku: string;
  description: string;
  images: string[];
  videoUrl?: string;
  embedDirectVideo?: boolean; // Directly embed video player in Media Gallery card
  features: { icon: string; title: string; desc: string }[];
  specifications: { key: string; value: string }[];
  howToUseSteps: { step: number; title: string; desc: string; icon?: string }[];
  countdownEndDate?: string; // ISO string
  bundles?: { quantity: number; title: string; savingsText: string; pricePerUnit: number }[];

  // Custom Editable Page Texts
  customPromoBadgeText?: string;
  customRatingText?: string;
  customDeliveryBadgeText?: string;
  customCtaButtonText?: string;
  customTrustText?: string;
  customStockAlertText?: string;

  mediaSectionBadge?: string;
  mediaSectionTitle?: string;
  mediaHighlightsTitle?: string;
  mediaBullet1?: string;
  mediaBullet2?: string;
  mediaBullet3?: string;
  mediaVideoBadgeText?: string;

  featuresSectionBadge?: string;
  featuresSectionTitle?: string;
  featuresSectionDesc?: string;

  specsSectionBadge?: string;
  specsSectionTitle?: string;

  howToUseSectionBadge?: string;
  howToUseSectionTitle?: string;

  reviewsSectionBadge?: string;
  reviewsSectionTitle?: string;

  faqSectionBadge?: string;
  faqSectionTitle?: string;

  orderFormTitle?: string;
  orderFormSubtitle?: string;
  orderFormBadgeText?: string;
  orderFormButtonText?: string;
}

export interface OrderData {
  id: string;
  orderNumber: string; // e.g. COD-10842
  customerName: string;
  phone: string;
  address: string;
  district: string;
  upazila: string;
  quantity: number;
  unitPrice: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string; // "COD"
  status: OrderStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  riskReasons: string[];
  orderNote?: string;
  ipAddress?: string;
  userAgent?: string;
  eventId: string; // Meta CAPI deterministic event_id
  courierName?: 'STEADFAST' | 'PATHAO';
  courierTracking?: string;
  isOtpVerified: boolean;
  createdAt: string;
}

export interface ReviewData {
  id: string;
  authorName: string;
  rating: number; // 1 to 5
  comment: string;
  location: string;
  isVerified: boolean;
  photoUrl?: string;
  createdAt: string;
}

export interface FaqData {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export interface StoreSettings {
  siteTitle: string;
  logoUrl?: string;
  primaryColor: string; // e.g., #059669
  accentColor: string;  // e.g., #d97706
  deliveryFeeInside: number;  // 70
  deliveryFeeOutside: number; // 130
  metaPixelId?: string;
  metaCapiToken?: string;
  metaTestEventCode?: string;
  metaDomainVerification?: string;

  tikTokPixelId?: string;
  tikTokAccessToken?: string;
  tikTokTestEventCode?: string;

  gaMeasurementId?: string;
  gaApiSecret?: string;
  gaTestEventCode?: string;
  googleAdsConversionId?: string;
  gtmContainerId?: string;

  firePurchaseOnlyOnConfirm?: boolean; // Send Purchase event only after admin order confirmation

  autoExpireTestCodes?: boolean; // Auto remove test codes after 24h
  testCodeSetAt?: string; // ISO string timestamp when test code was set
  telegramBotToken?: string;
  telegramChatId?: string;
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  pathaoStoreId?: string;
  pathaoToken?: string;
  customCss?: string;
  customJs?: string;
  footerDescription?: string;
  helplinePhone?: string;
  helplineEmail?: string;
  footerCopyright?: string;
  footerQuickLinksTitle?: string;
  footerReturnPolicyTitle?: string;
  footerReturnPolicyContent?: string;
  footerPrivacyPolicyTitle?: string;
  footerPrivacyPolicyContent?: string;
  footerTermsTitle?: string;
  footerTermsContent?: string;
  footerContactTitle?: string;
  footerTrustTitle?: string;
  footerTrustBadgeTitle?: string;
  footerTrustBadgeDesc?: string;

  sectionOrder: string[]; // array of section IDs e.g. ['hero', 'media', 'scarcity', ...]
  sectionVisibility: Record<string, boolean>; // e.g. { hero: true, scarcity: true }
}

export interface CouponData {
  id: string;
  code: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
}

export interface BlacklistEntry {
  id: string;
  phone?: string;
  ipAddress?: string;
  reason: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}
