import { mockCompatibilityProfiles } from "@/data/compatibility/profiles";
import { evaluateCompatibility } from "@/lib/compatibility-engine/engine";
import type {
  CompatibilityProfile,
  CompatibilityStatus,
  GpuSpec,
  MemorySpec
} from "@/types/compatibility";

type ExpectedRuleStatus = {
  ruleId: string;
  status: CompatibilityStatus;
};

export type CompatibilityValidationFixture = {
  expected: ExpectedRuleStatus[];
  name: string;
  profile: CompatibilityProfile;
  reason: string;
};

const gamingProfile = mockCompatibilityProfiles["gaming-r5-rtx3060"];
const optiplexProfile = mockCompatibilityProfiles["optiplex-7060-sff"];
const p520Profile = mockCompatibilityProfiles["thinkstation-p520-sleeper"];
const thinkPadProfile = mockCompatibilityProfiles["thinkpad-p1-gen4"];
const rtx3070 = p520Profile.upgradePlan?.gpu as GpuSpec;

export const compatibilityValidationFixtures: CompatibilityValidationFixture[] = [
  {
    expected: [
      { ruleId: "cpu-motherboard", status: "Compatible" },
      { ruleId: "gpu-length-chassis", status: "Compatible" },
      { ruleId: "psu-wattage-headroom", status: "Compatible" }
    ],
    name: "valid gaming PC",
    profile: gamingProfile,
    reason:
      "A Ryzen 5, B550 motherboard, RTX 3060, mid tower, and 650W PSU should pass core compatibility checks."
  },
  {
    expected: [
      { ruleId: "gpu-height-thickness", status: "Incompatible" },
      { ruleId: "gpu-length-chassis", status: "Incompatible" }
    ],
    name: "invalid GPU fit",
    profile: {
      ...optiplexProfile,
      id: "fixture-invalid-gpu-fit",
      title: "Dell OptiPlex SFF with RTX 3070 upgrade attempt",
      upgradePlan: {
        additionalM2Drives: 0,
        additionalRamGb: 0,
        additionalSataDrives: 0,
        gpu: rtx3070
      }
    },
    reason:
      "A full-height RTX 3070 should not fit the low-profile OptiPlex SFF chassis."
  },
  {
    expected: [{ ruleId: "psu-wattage-headroom", status: "Incompatible" }],
    name: "insufficient PSU",
    profile: {
      ...gamingProfile,
      id: "fixture-insufficient-psu",
      psu: {
        ...gamingProfile.psu,
        model: "300W test PSU",
        wattage: 300
      },
      title: "Gaming tower with undersized PSU"
    },
    reason:
      "The RTX 3060 system should fail PSU headroom when the PSU is reduced to 300W."
  },
  {
    expected: [{ ruleId: "ram-type", status: "Incompatible" }],
    name: "unsupported RAM",
    profile: {
      ...optiplexProfile,
      id: "fixture-unsupported-ram",
      title: "OptiPlex DDR5 upgrade attempt",
      upgradePlan: {
        additionalM2Drives: 0,
        additionalRamGb: 0,
        additionalSataDrives: 0,
        memory: {
          capacityGb: 32,
          sticks: 2,
          type: "DDR5"
        } satisfies MemorySpec
      }
    },
    reason:
      "A Q370 OptiPlex platform supports DDR4, not DDR5."
  },
  {
    expected: [
      { ruleId: "m2-slots", status: "Compatible with Warning" },
      { ruleId: "sata-ports", status: "Incompatible" }
    ],
    name: "full storage ports",
    profile: {
      ...optiplexProfile,
      id: "fixture-full-storage-ports",
      title: "OptiPlex storage overfill attempt",
      upgradePlan: {
        additionalM2Drives: 1,
        additionalRamGb: 0,
        additionalSataDrives: 3
      }
    },
    reason:
      "The storage plan requests more M.2 and SATA devices than the SFF motherboard can host."
  },
  {
    expected: [
      { ruleId: "gpu-length-chassis", status: "Compatible" },
      { ruleId: "ram-capacity", status: "Compatible" },
      { ruleId: "upgrade-path", status: "Compatible" }
    ],
    name: "workstation upgrade",
    profile: p520Profile,
    reason:
      "The ThinkStation P520 should have enough chassis, PSU, RAM, and storage expansion for a careful workstation upgrade."
  },
  {
    expected: [
      { ruleId: "gpu-motherboard-pcie", status: "Compatible with Warning" },
      { ruleId: "gpu-length-chassis", status: "Compatible" },
      { ruleId: "psu-connectors", status: "Compatible" }
    ],
    name: "laptop + eGPU example",
    profile: {
      ...thinkPadProfile,
      gpu: null,
      id: "fixture-laptop-egpu",
      motherboard: {
        ...thinkPadProfile.motherboard,
        externalGpuInterfaces: ["thunderbolt-4"],
        pcieSlots: []
      },
      title: "ThinkPad P1 with Thunderbolt eGPU dock",
      upgradePlan: {
        additionalM2Drives: 0,
        additionalRamGb: 0,
        additionalSataDrives: 0,
        externalGpuDock: {
          interface: "thunderbolt-4",
          maxGpuLengthMm: 310,
          maxGpuSlotWidth: 3,
          maxPowerWatts: 500,
          powerConnectors: { "8-pin": 2 }
        },
        gpu: rtx3070
      }
    },
    reason:
      "A laptop eGPU path should be possible through Thunderbolt, but with a bandwidth warning."
  }
];

export function getCompatibilityValidationResults() {
  return compatibilityValidationFixtures.map((fixture) => {
    const report = evaluateCompatibility(fixture.profile);
    const expectedResults = fixture.expected.map((expected) => {
      const actual = report.results.find((result) => result.ruleId === expected.ruleId);

      return {
        ...expected,
        actualStatus: actual?.status ?? "Missing",
        passed: actual?.status === expected.status
      };
    });

    return {
      ...fixture,
      expectedResults,
      passed: expectedResults.every((result) => result.passed),
      report
    };
  });
}
