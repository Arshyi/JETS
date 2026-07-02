import type { DecisionCandidateInput } from "@/types/decision";
import type { HardwareListing } from "@/types/hardware";
import type { NormalizedListing } from "@/types/ingestion";

export function hardwareListingToDecisionCandidate(
  listing: HardwareListing
): DecisionCandidateInput {
  return {
    condition: listing.condition,
    currency: "USD",
    formFactor: listing.formFactor,
    id: listing.id,
    location: listing.location,
    price: listing.predictedNegotiatedPrice,
    providedScores: listing.scores,
    recommendedUseCase: listing.recommendedUseCase,
    recommendedUseCases: listing.recommendedUseCases,
    riskNotes: listing.riskNotes,
    specs: listing.specs,
    summary: listing.summary,
    tags: listing.tags,
    title: listing.title,
    weightClass: listing.weightClass
  };
}

export function normalizedListingToDecisionCandidate(
  listing: NormalizedListing
): DecisionCandidateInput {
  const recommendedUseCase = listing.recommendedUseCases[0] ?? "general";

  return {
    condition: listing.condition,
    currency: listing.currency,
    formFactor: listing.formFactor,
    freshness: listing.freshness,
    id: listing.id,
    location: listing.location,
    price: listing.price,
    recommendedUseCase,
    recommendedUseCases: listing.recommendedUseCases,
    riskNotes: listing.riskSignals,
    sourceName: listing.sourceName,
    specs: listing.specs,
    summary: listing.description,
    tags: [listing.category, listing.sourceName, listing.sellerName],
    title: listing.title
  };
}
