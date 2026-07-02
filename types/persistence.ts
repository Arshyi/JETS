export type AuthGateState = {
  isConfigured: boolean;
  isSignedIn: boolean;
  message?: string;
};

export type SearchPersistenceState = AuthGateState & {
  favoriteListingIds: string[];
  savedListingIds: string[];
};

export type ActionState = {
  message: string;
  status: "idle" | "success" | "error";
};
