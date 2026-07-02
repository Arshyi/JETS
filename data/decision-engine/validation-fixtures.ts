import { mockHardwareListings } from "@/data/mock-listings";
import { evaluateHardwareListing } from "@/lib/decision-engine/ranking";
import type { HardwareUseCase } from "@/types/hardware";

export type DecisionValidationFixture = {
  betterListingId: string;
  minimumScoreGap: number;
  name: string;
  reason: string;
  useCase: HardwareUseCase;
  worseListingId: string;
};

export const decisionValidationFixtures: DecisionValidationFixture[] = [
  {
    betterListingId: "gaming-r5-rtx3060",
    minimumScoreGap: 18,
    name: "usable gaming tower outranks no-boot gaming tower",
    reason:
      "A working RTX 3060 tower should beat a broken Alienware for gaming even when the broken system lists higher-end parts.",
    useCase: "gaming",
    worseListingId: "broken-alienware-aurora"
  },
  {
    betterListingId: "thinkstation-p520-sleeper",
    minimumScoreGap: 8,
    name: "workstation sleeper outranks office SFF for homelab",
    reason:
      "ECC memory, workstation chassis, and upgrade room should matter more than compact office convenience for homelab.",
    useCase: "homelab",
    worseListingId: "optiplex-7060-sff"
  },
  {
    betterListingId: "thinkstation-p330-tiny",
    minimumScoreGap: 6,
    name: "known tiny workstation outranks older render node for CAD",
    reason:
      "CAD should prefer reliability and workstation GPU fit over an older, fair-condition render node.",
    useCase: "cad",
    worseListingId: "hp-z440-render-node"
  }
];

function getListingOrThrow(listingId: string) {
  const listing = mockHardwareListings.find((candidate) => candidate.id === listingId);

  if (!listing) {
    throw new Error(`Decision validation fixture references unknown listing ${listingId}.`);
  }

  return listing;
}

export function getDecisionValidationResults() {
  return decisionValidationFixtures.map((fixture) => {
    const betterScore = evaluateHardwareListing(
      getListingOrThrow(fixture.betterListingId),
      fixture.useCase
    ).breakdown.finalScore;
    const worseScore = evaluateHardwareListing(
      getListingOrThrow(fixture.worseListingId),
      fixture.useCase
    ).breakdown.finalScore;

    return {
      ...fixture,
      betterScore,
      passed: betterScore - worseScore >= fixture.minimumScoreGap,
      worseScore
    };
  });
}
