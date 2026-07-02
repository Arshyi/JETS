import type {
  ListingSource,
  ListingSourceId,
  MockMarketplaceListingSeed
} from "@/types/ingestion";

export const mockListingSources: ListingSource[] = [
  {
    adapterMode: "mock-dry-run",
    baseUrl: "https://dubizzle.com",
    complianceNotes: [
      "Future access must respect robots.txt, site terms, and source-specific rate limits.",
      "Do not collect personal seller contact details beyond what is needed for listing review.",
      "Prefer permissioned feeds, public APIs, or manual exports before browser automation."
    ],
    enabled: true,
    id: "dubizzle",
    kind: "marketplace",
    locationScope: "UAE marketplace",
    name: "Dubizzle",
    rateLimit: {
      cooldownSeconds: 45,
      maxRequestsPerMinute: 4,
      notes:
        "Dry run only. A real adapter should begin conservative and back off on any blocked or degraded response."
    },
    status: "paused"
  },
  {
    adapterMode: "mock-dry-run",
    baseUrl: "https://www.amazon.ae",
    complianceNotes: [
      "Use approved Amazon APIs or affiliate-compliant data sources only.",
      "Do not scrape checkout, cart, account, or personalized pricing surfaces.",
      "Store only normalized listing facts needed for comparison and freshness tracking."
    ],
    enabled: true,
    id: "amazon-ae",
    kind: "retail",
    locationScope: "UAE online retail",
    name: "Amazon.ae",
    rateLimit: {
      cooldownSeconds: 60,
      maxRequestsPerMinute: 2,
      notes:
        "Dry run only. Real ingestion should require approved API credentials and explicit policy review."
    },
    status: "setup-required"
  },
  {
    adapterMode: "mock-dry-run",
    baseUrl: null,
    complianceNotes: [
      "Use vendor-approved feeds, quotes, or manually provided inventory sheets.",
      "Keep store identity and warranty terms visible so users can assess practical buying risk.",
      "Do not imply marketplace availability until a vendor-provided source confirms it."
    ],
    enabled: true,
    id: "computer-plaza",
    kind: "local-vendor",
    locationScope: "Computer Plaza and nearby UAE vendors",
    name: "Computer Plaza",
    rateLimit: {
      cooldownSeconds: 120,
      maxRequestsPerMinute: 1,
      notes:
        "Dry run only. Real ingestion should favor scheduled vendor uploads over automated page reads."
    },
    status: "healthy"
  },
  {
    adapterMode: "mock-dry-run",
    baseUrl: null,
    complianceNotes: [
      "Manual uploads must preserve original source attribution.",
      "CSV imports should validate required fields before creating normalized records.",
      "Uploaded data should be removable if the user or source asks for it."
    ],
    enabled: true,
    id: "manual-upload",
    kind: "manual",
    locationScope: "User-provided listings",
    name: "Manual Upload",
    rateLimit: {
      cooldownSeconds: 0,
      maxRequestsPerMinute: 0,
      notes:
        "No automated source requests. Future limits apply to CSV size, upload frequency, and validation cost."
    },
    status: "healthy"
  }
];

export const mockAdapterListings: Record<
  ListingSourceId,
  MockMarketplaceListingSeed[]
> = {
  "amazon-ae": [
    {
      categoryLabel: "GPU component",
      conditionLabel: "Good",
      currency: "AED",
      description:
        "Used RTX 3060 Ti card with seller-provided benchmark screenshot and original box.",
      externalId: "amz-ae-rtx3060ti-01",
      firstSeenDaysAgo: 6,
      location: "UAE shipping",
      observedDaysAgo: 1,
      price: 925,
      sellerName: "Verified marketplace seller",
      sourceId: "amazon-ae",
      specs: {
        GPU: "RTX 3060 Ti 8 GB",
        Length: "242 mm",
        Power: "200 W"
      },
      title: "NVIDIA RTX 3060 Ti 8GB Used Pull",
      url: null
    },
    {
      categoryLabel: "Gaming laptop",
      conditionLabel: "Excellent",
      currency: "AED",
      description:
        "Open-box gaming laptop candidate with RTX 4060 laptop GPU and full charger.",
      externalId: "amz-ae-g14-4060-01",
      firstSeenDaysAgo: 3,
      location: "UAE shipping",
      observedDaysAgo: 0,
      price: 3450,
      sellerName: "Warehouse deals mock",
      sourceId: "amazon-ae",
      specs: {
        CPU: "Ryzen 9 7940HS",
        GPU: "RTX 4060 Laptop",
        Memory: "16 GB DDR5",
        Storage: "1 TB NVMe"
      },
      title: "ASUS ROG Zephyrus G14 RTX 4060 Laptop",
      url: null
    },
    {
      categoryLabel: "Workstation GPU",
      conditionLabel: "Fair",
      currency: "AED",
      description:
        "Older Quadro card suitable for display output, lab machines, and light CAD review.",
      externalId: "amz-ae-p2000-01",
      firstSeenDaysAgo: 18,
      location: "UAE shipping",
      observedDaysAgo: 9,
      price: 450,
      sellerName: "Parts reseller mock",
      sourceId: "amazon-ae",
      specs: {
        GPU: "Quadro P2000",
        Memory: "5 GB GDDR5",
        Power: "75 W"
      },
      title: "NVIDIA Quadro P2000 Low Power CAD GPU",
      url: null
    },
    {
      categoryLabel: "Repair-risk component",
      conditionLabel: "For parts",
      currency: "AED",
      description:
        "RX 6700 XT listed as powering on with no display. Useful only as a parts or repair gamble.",
      externalId: "amz-ae-rx6700xt-parts-01",
      firstSeenDaysAgo: 16,
      location: "UAE shipping",
      observedDaysAgo: 11,
      price: 375,
      sellerName: "Returns liquidator mock",
      sourceId: "amazon-ae",
      specs: {
        GPU: "RX 6700 XT 12 GB",
        Fault: "No display",
        Warranty: "None"
      },
      title: "Radeon RX 6700 XT For Parts No Display",
      url: null
    }
  ],
  "computer-plaza": [
    {
      categoryLabel: "Workstation desktop",
      conditionLabel: "Good",
      currency: "AED",
      description:
        "Lenovo workstation base with ECC memory and GPU headroom for a sleeper build.",
      externalId: "cp-p520-64gb-01",
      firstSeenDaysAgo: 12,
      location: "Dubai, UAE",
      observedDaysAgo: 1,
      price: 1450,
      sellerName: "Computer Plaza vendor mock",
      sourceId: "computer-plaza",
      specs: {
        CPU: "Xeon W-2135",
        GPU: "Quadro P2000",
        Memory: "64 GB ECC DDR4",
        Storage: "1 TB NVMe"
      },
      title: "Lenovo ThinkStation P520 Xeon W-2135 64GB",
      url: null
    },
    {
      categoryLabel: "Office desktop",
      conditionLabel: "Good",
      currency: "AED",
      description:
        "Small office desktop with Windows license and SSD health check available on request.",
      externalId: "cp-optiplex-7060-01",
      firstSeenDaysAgo: 8,
      location: "Dubai, UAE",
      observedDaysAgo: 3,
      price: 700,
      sellerName: "Computer Plaza vendor mock",
      sourceId: "computer-plaza",
      specs: {
        CPU: "Core i5-8500",
        GPU: "Intel UHD 630",
        Memory: "16 GB DDR4",
        Storage: "512 GB SSD"
      },
      title: "Dell OptiPlex 7060 SFF i5 16GB 512GB",
      url: null
    },
    {
      categoryLabel: "Gaming desktop",
      conditionLabel: "Fair",
      currency: "AED",
      description:
        "Older tower with GTX 1080 Ti. Needs thermal inspection before ranking highly.",
      externalId: "cp-i7-1080ti-01",
      firstSeenDaysAgo: 22,
      location: "Dubai, UAE",
      observedDaysAgo: 8,
      price: 1775,
      sellerName: "Gaming refurbisher mock",
      sourceId: "computer-plaza",
      specs: {
        CPU: "Core i7-8700K",
        GPU: "GTX 1080 Ti 11 GB",
        Memory: "32 GB DDR4",
        Storage: "512 GB SSD"
      },
      title: "Core i7 Gaming Tower GTX 1080 Ti",
      url: null
    },
    {
      categoryLabel: "Engineering desktop",
      conditionLabel: "Excellent",
      currency: "AED",
      description:
        "Compact CAD workstation with Quadro P620 and low-power CPU for desk setups.",
      externalId: "cp-p330-tiny-01",
      firstSeenDaysAgo: 4,
      location: "Dubai, UAE",
      observedDaysAgo: 0,
      price: 1200,
      sellerName: "Workstation refurbisher mock",
      sourceId: "computer-plaza",
      specs: {
        CPU: "Core i7-9700T",
        GPU: "Quadro P620",
        Memory: "32 GB DDR4",
        Storage: "512 GB NVMe"
      },
      title: "ThinkStation P330 Tiny CAD Workstation",
      url: null
    }
  ],
  dubizzle: [
    {
      categoryLabel: "Gaming desktop",
      conditionLabel: "Good",
      currency: "AED",
      description:
        "Balanced Ryzen 5 tower with RTX 3060 for 1080p and light 1440p gaming.",
      externalId: "dub-ryzen-3060-01",
      firstSeenDaysAgo: 5,
      location: "Dubai, UAE",
      observedDaysAgo: 1,
      price: 2250,
      sellerName: "Private seller mock",
      sourceId: "dubizzle",
      specs: {
        CPU: "Ryzen 5 5600",
        GPU: "RTX 3060 12 GB",
        Memory: "16 GB DDR4",
        Storage: "1 TB NVMe"
      },
      title: "Ryzen 5 Gaming PC RTX 3060 12GB",
      url: null
    },
    {
      categoryLabel: "Workstation desktop",
      conditionLabel: "Good",
      currency: "AED",
      description:
        "ThinkStation base with ECC memory, Quadro GPU, and enough case room for upgrades.",
      externalId: "dub-p520-64gb-01",
      firstSeenDaysAgo: 10,
      location: "Dubai, UAE",
      observedDaysAgo: 2,
      price: 1400,
      sellerName: "Business surplus mock",
      sourceId: "dubizzle",
      specs: {
        CPU: "Xeon W-2135",
        GPU: "Quadro P2000",
        Memory: "64 GB ECC DDR4",
        Storage: "1 TB NVMe"
      },
      title: "Lenovo ThinkStation P520 Xeon W2135 64GB RAM",
      url: null
    },
    {
      categoryLabel: "Office desktop",
      conditionLabel: "Fair",
      currency: "AED",
      description:
        "Budget office PC candidate with enough CPU for general productivity and light lab duty.",
      externalId: "dub-optiplex-7060-01",
      firstSeenDaysAgo: 14,
      location: "Sharjah, UAE",
      observedDaysAgo: 6,
      price: 675,
      sellerName: "Office clearout mock",
      sourceId: "dubizzle",
      specs: {
        CPU: "Core i5-8500",
        GPU: "Intel UHD 630",
        Memory: "16 GB DDR4",
        Storage: "512 GB SSD"
      },
      title: "Dell OptiPlex 7060 SFF 16GB SSD",
      url: null
    },
    {
      categoryLabel: "Repair-risk desktop",
      conditionLabel: "Broken",
      currency: "AED",
      description:
        "Alienware tower listed as no boot. GPU and CPU are not independently verified.",
      externalId: "dub-alienware-r10-parts-01",
      firstSeenDaysAgo: 27,
      location: "Abu Dhabi, UAE",
      observedDaysAgo: 12,
      price: 1300,
      sellerName: "Private seller mock",
      sourceId: "dubizzle",
      specs: {
        CPU: "Ryzen 7 5800",
        GPU: "RTX 3070 unverified",
        Memory: "16 GB DDR4",
        Fault: "No boot"
      },
      title: "Alienware Aurora R10 No Boot For Parts",
      url: null
    }
  ],
  "manual-upload": [
    {
      categoryLabel: "Workstation desktop",
      conditionLabel: "Good",
      currency: "AED",
      description:
        "CSV-imported ThinkStation candidate from a technician note. Needs source confirmation.",
      externalId: "manual-p520-64gb-quote",
      firstSeenDaysAgo: 9,
      location: "Dubai, UAE",
      observedDaysAgo: 1,
      price: 1375,
      sellerName: "Technician note",
      sourceId: "manual-upload",
      specs: {
        CPU: "Xeon W-2135",
        GPU: "Quadro P2000",
        Memory: "64 GB ECC DDR4",
        Storage: "1 TB NVMe"
      },
      title: "ThinkStation P520 W-2135 64GB ECC Workstation",
      url: null
    },
    {
      categoryLabel: "GPU component",
      conditionLabel: "Good",
      currency: "AED",
      description:
        "Manually entered RTX 3060 Ti listing with stress test video mentioned in notes.",
      externalId: "manual-3060ti-fe-01",
      firstSeenDaysAgo: 7,
      location: "Dubai, UAE",
      observedDaysAgo: 2,
      price: 890,
      sellerName: "Manual source mock",
      sourceId: "manual-upload",
      specs: {
        GPU: "RTX 3060 Ti 8 GB",
        Length: "242 mm",
        Power: "200 W"
      },
      title: "RTX 3060 Ti Founders Edition 8GB",
      url: null
    },
    {
      categoryLabel: "Laptop",
      conditionLabel: "Excellent",
      currency: "AED",
      description:
        "Business laptop entry for travel engineering and general productivity comparison.",
      externalId: "manual-thinkpad-p1-g4-01",
      firstSeenDaysAgo: 4,
      location: "Abu Dhabi, UAE",
      observedDaysAgo: 0,
      price: 3350,
      sellerName: "Manual source mock",
      sourceId: "manual-upload",
      specs: {
        CPU: "Core i7-11850H",
        GPU: "RTX A2000 Laptop",
        Memory: "32 GB DDR4",
        Storage: "1 TB NVMe"
      },
      title: "ThinkPad P1 Gen 4 RTX A2000 Mobile Workstation",
      url: null
    },
    {
      categoryLabel: "Repair-risk laptop",
      conditionLabel: "For parts",
      currency: "AED",
      description:
        "Water-damaged MacBook parts unit. Value depends on screen, chassis, and salvageable parts.",
      externalId: "manual-mbp-water-parts-01",
      firstSeenDaysAgo: 21,
      location: "UAE shipping",
      observedDaysAgo: 13,
      price: 1550,
      sellerName: "Manual source mock",
      sourceId: "manual-upload",
      specs: {
        CPU: "Apple M1 Pro",
        Fault: "Water damage",
        Memory: "Unknown",
        Storage: "Removed"
      },
      title: "MacBook Pro 16 Water Damage Parts Unit",
      url: null
    }
  ]
};
