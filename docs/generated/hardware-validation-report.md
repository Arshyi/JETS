# JETS Hardware Knowledge Validation Report

Generated: 2026-07-06T00:00:00.000Z

Overall: PASS

- Scenario pass rate: 100%
- Passed scenarios: 12
- Failed scenarios: 0
- Action plan fixture failures: 0
- Playbook fixture failures: 0
- Strategy fixture failures: 0
- Platform knowledge warnings: 3
- Compatibility fixture failures: 0

## Scenario Results

| Status | Scenario | Platform | Readiness | Confidence |
| --- | --- | --- | --- | --- |
| PASS | ThinkStation P510 | thinkstation-p510 | needs-review | high |
| PASS | OptiPlex 7060 SFF | optiplex-7060 | needs-review | medium |
| PASS | Precision 5820 | precision-5820 | needs-review | high |
| PASS | HP Z440 | hp-z440 | needs-review | high |
| PASS | Gaming Build | unknown | needs-review | medium |
| PASS | AI Workstation | thinkstation-p520 | needs-review | high |
| PASS | Engineering Workstation | thinkstation-p520 | needs-review | high |
| PASS | Budget Office PC | optiplex-7060 | needs-review | medium |
| PASS | Broken Listing | unknown | not-ready | low |
| PASS | Unknown Listing | unknown | not-ready | low |
| PASS | Low Confidence Listing | unknown | not-ready | low |
| PASS | Duplicate Listing | thinkstation-p520 | needs-review | high |

## Rule Coverage

### action-plan

Coverage: 6/6 (100%)

Uncovered:
- None

### marketplace

Coverage: 6/6 (100%)

Uncovered:
- None

### listing

Coverage: 9/9 (100%)

Uncovered:
- None

### evidence

Coverage: 4/4 (100%)

Uncovered:
- None

### platform

Coverage: 8/19 (42%)

Uncovered:
- platform-adapter:m2-to-pcie-adapter
- platform-adapter:mini-pcie-adapter
- platform-adapter:pcie-nvme-adapter
- platform-adapter:pcie-usb-controller
- platform-adapter:pcie-wifi-card
- platform-adapter:sas-hba
- platform-adapter:ten-gbe-nic
- platform-adapter:usb-c-expansion-card
- platform:hp-z840
- platform:mac-pro-5-1
- platform:precision-t5810

### playbook

Coverage: 12/12 (100%)

Uncovered:
- None

### solution

Coverage: 9/17 (53%)

Uncovered:
- solution:cad
- solution:engineering
- solution:gaming
- solution:home-server
- solution:programming
- solution:rendering
- solution:streaming
- solution:virtualization

### strategy

Coverage: 8/8 (100%)

Uncovered:
- None

### optimization

Coverage: 6/10 (60%)

Uncovered:
- optimization:enthusiast-depth
- optimization:maximize-reliability
- optimization:maximize-upgradeability
- optimization:standard-depth

### compatibility

Coverage: 11/18 (61%)

Uncovered:
- compatibility:bios-generation-risk
- compatibility:case-airflow
- compatibility:cpu-cooler-clearance
- compatibility:platform-age
- compatibility:ram-slots
- compatibility:storage-interface
- compatibility:thermal-risk

### builder

Coverage: 3/11 (27%)

Uncovered:
- builder:bios-and-platform-age
- builder:component-category-fits-slot
- builder:cooling-and-airflow
- builder:display-availability
- builder:pcie-generation-fit
- builder:ram-platform-fit
- builder:slot-headroom
- builder:storage-interface-fit

## Action Plan Validation

| Status | Fixture | Tasks | Issues |
| --- | --- | ---: | --- |
| PASS | Engineering Workstation action plan | 12 | None |

## Platform Knowledge Validation

| Status | Platform | Knowledge quality | Evidence records | Issues |
| --- | --- | ---: | ---: | --- |
| PASS | Lenovo ThinkStation P520 | 64 | 6 | None |
| PASS | Lenovo ThinkStation P510 | 52 | 2 | None |
| FAIL | Dell Precision T5810 | 34 | 1 | Knowledge quality score is low |
| PASS | Dell Precision 5820 | 50 | 1 | None |
| PASS | Dell OptiPlex 7060 SFF | 68 | 3 | None |
| FAIL | HP Z440 | 35 | 2 | Knowledge quality score is low |
| PASS | HP Z840 | 52 | 2 | None |
| FAIL | Mac Pro 5,1 | 38 | 2 | Knowledge quality score is low |

## Playbook Validation

| Status | Platform | Playbooks | Issues |
| --- | --- | ---: | --- |
| PASS | Lenovo ThinkStation P520 | 1 | None |
| PASS | Lenovo ThinkStation P510 | 2 | None |
| PASS | Dell Precision T5810 | 1 | None |
| PASS | Dell Precision 5820 | 1 | None |
| PASS | Dell OptiPlex 7060 SFF | 1 | None |
| PASS | HP Z440 | 1 | None |
| PASS | HP Z840 | 1 | None |
| PASS | Mac Pro 5,1 | 1 | None |

## Strategy Validation

| Status | Fixture | Expected top strategy | Actual top strategy |
| --- | --- | --- | --- |
| PASS | Budget too small | wait-for-better-value | wait-for-better-value |
| PASS | Overpriced workstation | wait-for-better-value | wait-for-better-value |
| PASS | Amazing deal | buy-used-workstation | buy-used-workstation |
| PASS | Bad platform | wait-for-better-value | wait-for-better-value |
| PASS | Excellent platform | buy-used-workstation | buy-used-workstation |
| PASS | Repair candidate | repair-existing-hardware | repair-existing-hardware |

## Compatibility Fixture Failures

No compatibility fixture failures.

## Scenario Failure Details

No scenario failures.
