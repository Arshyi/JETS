import type {
  MarketplaceSourceAdapterDefinition,
  RawMarketplaceListing
} from "@/types/marketplace-intelligence";

export const marketplaceSourceAdapterDefinitions: MarketplaceSourceAdapterDefinition[] = [
  {
    accessMode: "mock-adapter",
    complianceNotes: [
      "Future access requires source terms and robots.txt review.",
      "Prefer approved API, export, or user-provided listing URLs before automation."
    ],
    id: "dubizzle",
    name: "Dubizzle",
    stage: "demo"
  },
  {
    accessMode: "future-browser-extension",
    complianceNotes: [
      "Future browser extension should run user-initiated capture only.",
      "Do not collect private messages, contact details, or hidden seller data."
    ],
    id: "facebook-marketplace",
    name: "Facebook Marketplace",
    stage: "blocked-until-policy-review"
  },
  {
    accessMode: "future-approved-api",
    complianceNotes: [
      "Use official API or compliant data access only.",
      "Respect marketplace rate limits, attribution, and removal requests."
    ],
    id: "ebay",
    name: "eBay",
    stage: "planned"
  },
  {
    accessMode: "future-approved-api",
    complianceNotes: [
      "Use compliant access or manual exports only.",
      "Regional marketplace rules should be reviewed before any connector work."
    ],
    id: "kijiji",
    name: "Kijiji",
    stage: "planned"
  },
  {
    accessMode: "future-browser-extension",
    complianceNotes: [
      "Future access must be user-initiated and policy reviewed.",
      "Avoid scraping contact, messaging, or anti-abuse surfaces."
    ],
    id: "craigslist",
    name: "Craigslist",
    stage: "blocked-until-policy-review"
  },
  {
    accessMode: "future-approved-api",
    complianceNotes: [
      "Auction data should come from approved access or user-provided exports.",
      "Currency, shipping, and proxy-bidding details need separate normalization."
    ],
    id: "yahoo-auctions",
    name: "Yahoo Auctions",
    stage: "planned"
  },
  {
    accessMode: "future-approved-api",
    complianceNotes: [
      "Use approved APIs or manual listing entry only.",
      "Seller identity and transaction details are out of scope."
    ],
    id: "mercari",
    name: "Mercari",
    stage: "planned"
  },
  {
    accessMode: "future-approved-api",
    complianceNotes: [
      "Use Amazon-approved APIs or compliant feeds.",
      "Do not scrape checkout, cart, account, or personalized pricing surfaces."
    ],
    id: "amazon-renewed",
    name: "Amazon Renewed",
    stage: "planned"
  },
  {
    accessMode: "future-approved-api",
    complianceNotes: [
      "Use approved APIs or partner feeds.",
      "Separate marketplace seller metadata from hardware metadata."
    ],
    id: "newegg",
    name: "Newegg",
    stage: "planned"
  },
  {
    accessMode: "future-csv",
    complianceNotes: [
      "Prefer vendor-approved inventory sheets.",
      "Keep warranty, store identity, and quote timestamp visible."
    ],
    id: "local-computer-store",
    name: "Local Computer Store",
    stage: "planned"
  },
  {
    accessMode: "future-csv",
    complianceNotes: [
      "CSV imports should validate required fields before normalization.",
      "Original source attribution should be preserved."
    ],
    id: "csv-import",
    name: "CSV Import",
    stage: "planned"
  },
  {
    accessMode: "future-manual-entry",
    complianceNotes: [
      "Manual entries should mark unknown fields as unknown.",
      "Never invent specs that are not provided by the user."
    ],
    id: "manual-entry",
    name: "Manual Entry",
    stage: "planned"
  },
  {
    accessMode: "future-approved-api",
    complianceNotes: [
      "Generic future API connector placeholder.",
      "Requires source-specific policy, auth, rate limit, and data retention review."
    ],
    id: "future-api",
    name: "Future API",
    stage: "planned"
  }
];

export const mockMarketplaceRawListings: RawMarketplaceListing[] = [
  {
    categoryLabel: "Workstation desktop",
    currency: "AED",
    description:
      "Dell tower workstation, Xeon W CPU, 32GB memory, Quadro P2000, 512GB SSD. Good for CAD. No OS mentioned.",
    externalId: "demo-precision-5820-01",
    imageCount: 6,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { listingAgeDays: 2, promoted: false },
    observedAt: "2026-07-05T09:00:00.000Z",
    priceText: "AED 1850",
    sellerDisplayName: "Workstation refurbisher demo",
    sellerRatingText: "4.7/5 vendor rating",
    sourceId: "local-computer-store",
    title: "Dell Precision 5820 Xeon W 32GB P2000",
    url: null
  },
  {
    categoryLabel: "Workstation desktop",
    currency: "AED",
    description:
      "Lenovo P520 base. Xeon W-2135, 64 GB ECC DDR4, Quadro P2000, 1TB NVMe. Good condition, tested.",
    externalId: "demo-thinkstation-p520-01",
    imageCount: 8,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { listingAgeDays: 1, promoted: false },
    observedAt: "2026-07-05T09:05:00.000Z",
    priceText: "AED 1450",
    sellerDisplayName: "Business surplus demo",
    sellerRatingText: "Verified vendor",
    sourceId: "dubizzle",
    title: "Lenovo ThinkStation P520 W-2135 64GB ECC Workstation",
    url: null
  },
  {
    categoryLabel: "Office desktop",
    currency: "AED",
    description:
      "Small office PC. Intel i5 8500, 16GB RAM, 512GB SSD, Windows 11 Pro. No graphics card.",
    externalId: "demo-optiplex-7060-01",
    imageCount: 4,
    locationText: "Sharjah, UAE",
    marketplaceSpecific: { listingAgeDays: 5, promoted: false },
    observedAt: "2026-07-05T09:10:00.000Z",
    priceText: "AED 650",
    sellerDisplayName: "Office clearout demo",
    sourceId: "facebook-marketplace",
    title: "Dell OptiPlex 7060 SFF i5 16GB SSD",
    url: null
  },
  {
    categoryLabel: "Enthusiast workstation",
    currency: "USD",
    description:
      "Classic cheese grater Mac Pro tower. Dual CPU tray. 64GB RAM. RX 580 installed. NVMe adapter not included.",
    externalId: "demo-macpro-51-01",
    imageCount: 7,
    locationText: "Phoenix, AZ",
    marketplaceSpecific: { listingAgeDays: 8, promoted: false },
    observedAt: "2026-07-05T09:15:00.000Z",
    priceText: "$450",
    sellerDisplayName: "Local collector demo",
    sellerRatingText: "Longtime seller",
    sourceId: "craigslist",
    title: "Mac Pro 5,1 64GB RX 580 Dual CPU",
    url: null
  },
  {
    categoryLabel: "Gaming desktop",
    currency: "AED",
    description:
      "Ryzen gaming PC with RTX 3060 12GB, 16GB DDR4, 1TB NVMe, 650W PSU, Windows installed.",
    externalId: "demo-ryzen-3060-01",
    imageCount: 5,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { listingAgeDays: 3, promoted: true },
    observedAt: "2026-07-05T09:20:00.000Z",
    priceText: "AED 2250",
    sellerDisplayName: "Private seller demo",
    sourceId: "dubizzle",
    title: "Ryzen 5 Gaming PC RTX 3060 12GB",
    url: null
  },
  {
    categoryLabel: "Laptop",
    currency: "USD",
    description:
      "ThinkPad P1 Gen 4 mobile workstation. i7-11850H, RTX A2000 Laptop, 32GB RAM, 1TB NVMe.",
    externalId: "demo-thinkpad-p1-01",
    imageCount: 9,
    locationText: "Austin, TX",
    marketplaceSpecific: { listingAgeDays: 4, promoted: false },
    observedAt: "2026-07-05T09:25:00.000Z",
    priceText: "$850",
    sellerDisplayName: "Manual entry demo",
    sourceId: "manual-entry",
    title: "ThinkPad P1 Gen 4 RTX A2000 Mobile Workstation",
    url: null
  },
  {
    categoryLabel: "Mini PC",
    currency: "AED",
    description:
      "Tiny workstation for CAD office. Core i7-9700T, Quadro P620, 32GB RAM, 512GB NVMe.",
    externalId: "demo-p330-tiny-01",
    imageCount: 3,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { listingAgeDays: 6, promoted: false },
    observedAt: "2026-07-05T09:30:00.000Z",
    priceText: "AED 1200",
    sellerDisplayName: "CSV import demo",
    sourceId: "csv-import",
    title: "ThinkStation P330 Tiny CAD Workstation",
    url: null
  }
];
