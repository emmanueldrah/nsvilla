export interface Flyer {
  id: string;
  label: string;
  title: string;
  description: string;
  image: string;
  linkUrl: string;
  linkText: string;
  validFrom: string;
  validUntil: string;
  showAsBanner: boolean;
  active: boolean;
  createdAt: string;
}

export interface ContactFields {
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  waPrimary: string;
  waSecondary: string;
  airbnb: string;
  tiktok: string;
  facebook: string;
}

export interface CardItem {
  tag: string;
  title: string;
  body: string;
}

export interface PricingItem extends CardItem {
  points: string[];
}

export interface SiteContent {
  updatedAt: string | null;
  contact: ContactFields;
  hero: { headline: string; lead: string; note: string };
  rooms: CardItem[];
  amenities: CardItem[];
  pricing: PricingItem[];
  footer: { tagline: string; copyright: string };
  flyers: Flyer[];
}