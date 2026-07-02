export const hardwareUseCases = [
  "gaming",
  "cad",
  "engineering",
  "ai",
  "general"
] as const;

export const hardwareFormFactors = [
  "desktop",
  "laptop",
  "workstation",
  "component"
] as const;

export const hardwareConditions = [
  "excellent",
  "good",
  "fair",
  "broken"
] as const;

export const hardwareSortOptions = [
  "best-value",
  "highest-performance",
  "highest-reliability",
  "lowest-price",
  "best-sleeper"
] as const;

export type HardwareUseCase = (typeof hardwareUseCases)[number];
export type HardwareFormFactor = (typeof hardwareFormFactors)[number];
export type HardwareCondition = (typeof hardwareConditions)[number];
export type HardwareSortKey = (typeof hardwareSortOptions)[number];

export type HardwareFilters = {
  query: string;
  minBudget: number | null;
  maxBudget: number | null;
  useCase: HardwareUseCase | "all";
  formFactor: HardwareFormFactor | "all";
  condition: HardwareCondition | "all";
  location: string;
};

export type HardwareScores = {
  performance: number;
  value: number;
  reliability: number;
  aesthetic: number;
  upgradePotential: number;
  sleeper: number;
};

export type HardwareListing = {
  id: string;
  title: string;
  summary: string;
  price: number;
  predictedNegotiatedPrice: number;
  formFactor: HardwareFormFactor;
  condition: HardwareCondition;
  location: string;
  recommendedUseCase: HardwareUseCase;
  recommendedUseCases: HardwareUseCase[];
  weightClass: string;
  scores: HardwareScores;
  riskNotes: string[];
  specs: Record<string, string>;
  tags: string[];
};

export const useCaseLabels: Record<HardwareUseCase, string> = {
  gaming: "Gaming",
  cad: "CAD",
  engineering: "Engineering",
  ai: "AI",
  general: "General"
};

export const formFactorLabels: Record<HardwareFormFactor, string> = {
  desktop: "Desktop",
  laptop: "Laptop",
  workstation: "Workstation",
  component: "Component"
};

export const conditionLabels: Record<HardwareCondition, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  broken: "Broken/for parts"
};

export const sortLabels: Record<HardwareSortKey, string> = {
  "best-value": "Best value",
  "highest-performance": "Highest performance",
  "highest-reliability": "Highest reliability",
  "lowest-price": "Lowest price",
  "best-sleeper": "Best sleeper build"
};
