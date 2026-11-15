export interface AdSlotConfig {
  id: string;
  label: string;
  minHeightDesktop: number;
  minHeightMobile: number;
}

export const siteConfig = {
  brandName: 'ScholarPath USA',
  shortName: 'ScholarPath',
  tagline: 'Find Fully Funded and Partial Scholarships at U.S. Universities',
  siteUrl:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.APP_URL || '',
  // Owner-supplied details. Leave blank until real values are set in Admin -> Settings;
  // blank values are hidden from the public site rather than shown as placeholders.
  contactEmail: '',
  advertisingEmail: '',
  location: '',
  editorialTeamLead: '',
  lastSiteAuditDate: '2026-11-15',

  analytics: {
    ga4MeasurementId: '',
    googleSiteVerification: '',
  },

  /**
   * AdSense / Media.net Readiness Configuration
   * Keep `enabled: false` until domain approval is granted by Google AdSense / Media.net.
   * Flipping `enabled: true` activates non-intrusive, CLS-safe ad containers across the site.
   */
  ads: {
    enabled: false,
    showPreApprovalSlots: false,
    primaryNetwork: 'adsense' as 'adsense' | 'medianet',
    adsensePublisherId: '',
    revbitSiteId: '',
    slots: {
      header: {
        id: 'slot-header-leaderboard',
        label: 'Advertisement',
        minHeightDesktop: 90,
        minHeightMobile: 50,
      },
      inContent: {
        id: 'slot-in-content-responsive',
        label: 'Advertisement',
        minHeightDesktop: 250,
        minHeightMobile: 250,
      },
      sidebar: {
        id: 'slot-sidebar-rectangle',
        label: 'Advertisement',
        minHeightDesktop: 250,
        minHeightMobile: 250,
      },
      footer: {
        id: 'slot-footer-banner',
        label: 'Advertisement',
        minHeightDesktop: 90,
        minHeightMobile: 50,
      },
    } satisfies Record<string, AdSlotConfig>,
  },
} as const;
