import { hardwareListingToDecisionCandidate } from "@/lib/decision-engine/adapters";
import { evaluateDecisionCandidate } from "@/lib/decision-engine/scoring";
import type { HardwareListing, HardwareSortKey, HardwareUseCase } from "@/types/hardware";

export function evaluateHardwareListing(
  listing: HardwareListing,
  useCase: HardwareUseCase = listing.recommendedUseCase
) {
  return evaluateDecisionCandidate(
    hardwareListingToDecisionCandidate(listing),
    useCase
  );
}

export function sortListingsByDecision(
  listings: HardwareListing[],
  sortKey: HardwareSortKey,
  useCase?: HardwareUseCase
) {
  return [...listings].sort((a, b) => {
    const aUseCase = useCase ?? a.recommendedUseCase;
    const bUseCase = useCase ?? b.recommendedUseCase;
    const aEvaluation = evaluateHardwareListing(a, aUseCase);
    const bEvaluation = evaluateHardwareListing(b, bUseCase);

    if (sortKey === "lowest-price") {
      return a.price - b.price || bEvaluation.breakdown.finalScore - aEvaluation.breakdown.finalScore;
    }

    if (sortKey === "highest-performance") {
      return (
        bEvaluation.breakdown.performance - aEvaluation.breakdown.performance ||
        bEvaluation.breakdown.finalScore - aEvaluation.breakdown.finalScore
      );
    }

    if (sortKey === "highest-reliability") {
      return (
        bEvaluation.breakdown.reliability - aEvaluation.breakdown.reliability ||
        bEvaluation.breakdown.risk - aEvaluation.breakdown.risk
      );
    }

    if (sortKey === "best-sleeper") {
      return (
        b.scores.sleeper - a.scores.sleeper ||
        bEvaluation.breakdown.upgradePotential - aEvaluation.breakdown.upgradePotential
      );
    }

    return (
      bEvaluation.breakdown.finalScore - aEvaluation.breakdown.finalScore ||
      bEvaluation.breakdown.value - aEvaluation.breakdown.value
    );
  });
}
