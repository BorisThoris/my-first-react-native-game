# REG_EXECUTION_QUEUE

format_version: 1
selection_rule: lowest_phase_then_gate_then_priority_then_id
scope: offline_local_steam_mobile_v1
online_policy: implement_offline_portion_defer_server_required_remainder

current_state: queue_drained_2026_04_26
execution_truth: Use `docs/agent/REG_STATE_INDEX.json` (generated from `reg-state-index.mjs`) and `docs/agent/REG_ACCEPTANCE_CONTRACTS.md` for live per-REG status, commits, and deferrals. The `next_unblocked` list below is kept as a historical handoff map, not a live work queue.

gates:
  before_unbounded_REG_069_plus: [REG-068, REG-087, REG-088, REG-089]
  closeout_only: [REG-119]

next_unblocked:
  - { reg: REG-033, phase: 1, lane: bot_control, kind: doc_control, deps: [], slice: execution_queue_state_contracts }
  - { reg: REG-068, phase: 1, lane: product_gate, kind: scope_contract, deps: [REG-033], slice: offline_scope_acceptance }
  - { reg: REG-052, phase: 1, lane: product_gate, kind: deferral_contract, deps: [REG-033], slice: online_leaderboard_deferral_audit }
  - { reg: REG-089, phase: 1, lane: version_gate, kind: shared_tests, deps: [REG-033], slice: local_version_gate_hardening }
  - { reg: REG-087, phase: 1, lane: fairness_gate, kind: shared_tests, deps: [REG-033, REG-089], slice: softlock_fairness_gate }
  - { reg: REG-088, phase: 1, lane: first_run, kind: gameplay_ui, deps: [REG-068, REG-087, REG-089], slice: first_run_to_first_win }
  - { reg: REG-024, phase: 1, lane: economy_contract, kind: gameplay_contract, deps: [REG-089], slice: economy_taxonomy }
  - { reg: REG-040, phase: 1, lane: save_trust, kind: persistence, deps: [REG-089], slice: save_failure_recovery }
  - { reg: REG-063, phase: 1, lane: privacy, kind: telemetry, deps: [REG-052], slice: privacy_telemetry_policy_tests }
  - { reg: REG-015, phase: 2, lane: run_depth, kind: gameplay_ui, deps: [REG-024, REG-068, REG-087, REG-088, REG-089], slice: minimal_run_shop_currency }

phase_order:
  1: [REG-000, REG-024, REG-033, REG-040, REG-052, REG-063, REG-068, REG-087, REG-088, REG-089]
  2: [REG-015, REG-017, REG-018, REG-019, REG-020, REG-021, REG-022, REG-025, REG-045, REG-046, REG-047, REG-048, REG-049, REG-050, REG-065, REG-066, REG-069, REG-070, REG-071, REG-072, REG-073, REG-074, REG-075, REG-076, REG-077, REG-078, REG-079, REG-080, REG-081, REG-082, REG-083, REG-084, REG-085, REG-086]
  3A: [REG-001, REG-002, REG-003, REG-004, REG-005, REG-006, REG-007, REG-008, REG-009, REG-014, REG-028, REG-034, REG-044]
  3B: [REG-016, REG-023, REG-026, REG-032, REG-035, REG-036]
  4: [REG-010, REG-011, REG-012, REG-013, REG-037, REG-038, REG-051, REG-053, REG-054, REG-055, REG-059, REG-064, REG-067, REG-090, REG-091, REG-092, REG-093, REG-094, REG-095, REG-096, REG-097, REG-098, REG-099, REG-100, REG-101, REG-102, REG-103, REG-104, REG-105, REG-106, REG-107, REG-108, REG-113, REG-114]
  5: [REG-027, REG-029, REG-030, REG-031, REG-039, REG-041, REG-042, REG-043, REG-056, REG-057, REG-058, REG-062, REG-109, REG-110, REG-111, REG-112]
  6: [REG-120, REG-121, REG-122, REG-123, REG-124, REG-125, REG-126, REG-127, REG-128, REG-130, REG-131, REG-132, REG-133, REG-134, REG-135, REG-136, REG-137, REG-138, REG-139, REG-140, REG-141, REG-142, REG-143, REG-144, REG-145, REG-146, REG-147, REG-148, REG-149, REG-150, REG-151, REG-152, REG-153, REG-154, REG-155, REG-156, REG-157, REG-158, REG-159, REG-160]
  7: [REG-060, REG-061, REG-115, REG-116, REG-117, REG-118, REG-119, REG-129]

anti_stall:
  max_consecutive_doc_only: 1
  after_doc_only_next_kind_must_be_one_of: [shared_tests, gameplay_ui, persistence, telemetry, renderer_ui, e2e_hardening]
