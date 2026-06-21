export type HomePageCms = {
  heroSliderImages: string[];
  /** Looped MP4 under `/public` (e.g. `/media/hero-video-background.mp4`). Empty string disables video (slider/gradient only). */
  heroBackgroundVideoSrc?: string;
  heroContent: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
  };
  homeTestimonial: {
    quote: string;
    name: string;
    title: string;
    organization: string;
    initials: string;
  };
  homeSpotlightStory: {
    label: string;
    headline: string;
    paragraphs: string[];
    /** Rich HTML body when migrated from line-based paragraphs. */
    bodyHtml?: string;
    name: string;
    role: string;
    /** Legacy; no longer shown when `image` is set. */
    initials: string;
    /** Portrait for the spotlight tile (`/uploads/…` or media id resolved upstream). */
    image: string;
    ctaLabel: string;
    ctaHref: string;
  };
  homeReach: { title: string; intro: string };
  homeImpactMethodology: string;
  homeImpactStats: { value: string; label: string; note: string }[];
  homePartnerBlurb: string;
  /** Accent band above footer-style sections */
  homeCtaBand: {
    eyebrow: string;
    title: string;
    body: string;
    image?: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
  };
  homeEventsTitle: string;
  homeNewsTeaser: { title: string; subtitle: string };
};
