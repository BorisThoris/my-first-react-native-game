# REG_BLOCKERS_AND_DEFERRALS

```json
{
  "schema": 1,
  "entries": [
    {
      "reg": "REG-052",
      "scope": "competitive_online_leaderboards_and_server_authority",
      "status": "deferred",
      "reason_code": "OUT_OF_SCOPE_ONLINE_V1",
      "reason": "v1 scope excludes mandatory online accounts, server-backed realtime services, and competitive online leaderboards",
      "unblock_condition": "product reopens an online phase with backend trust, privacy, anti-cheat, and service ownership",
      "offline_portion_done": "local history and share/export may proceed under REG-041/REG-083 without server authority",
      "created_commit": "ce88cf2"
    },
    {
      "reg": "REG-060",
      "scope": "windows_steam_installer_runtime_smoke_on_linux_agent",
      "status": "blocked_until_phase_7",
      "reason_code": "PLATFORM_ENV_REQUIRED",
      "reason": "Windows installer and Steam client runtime validation cannot be fully executed in the current Linux cloud VM",
      "unblock_condition": "Windows x64 environment with Steam client and packaged build artifacts",
      "offline_portion_done": "scripts/checklists can be implemented before platform smoke",
      "created_commit": null
    },
    {
      "reg": "REG-061",
      "scope": "final_store_media_art_trailer_capsule",
      "status": "deferred_partial",
      "reason_code": "FINAL_LICENSED_MEDIA_REQUIRED",
      "reason": "implementation bot may wire placeholders and acceptance slots but must not generate/license final shippable marketing media",
      "unblock_condition": "approved final store media assets and rights metadata supplied",
      "offline_portion_done": "placeholder inventory and capture scripts may proceed under REG-113/REG-118",
      "created_commit": null
    }
  ]
}
```

## Program completion (offline v1)

For the current **offline v1** product bar, the REG set **REG-000** through **REG-160** is **fully addressed in the repository** as recorded in [REG_STATE_INDEX.json](REG_STATE_INDEX.json) and the generator in [reg-state-index.mjs](reg-state-index.mjs). There is **no remaining open refinement backlog** in that range except the three entries above:

| REG | Index status | Meaning |
|-----|----------------|--------|
| REG-052 | deferred | Online leaderboards and server trust are **out of scope** until product opens an online phase. |
| REG-060 | blocked | **Packaged** Windows + Steam runtime smoke **requires a Windows x64 + Steam** host; see [../qa/steam-package-smoke-checklist.md](../qa/steam-package-smoke-checklist.md) for the **offline** checklist only (does not mark REG-060 done). |
| REG-061 | deferred | **Final** store/trailer art requires **licensed** assets. |

**Do not** mark these three as `done` in the index without satisfying each row’s `unblock_condition` in the JSON. Further work is **new initiatives** (not unfinished REG tasks).
