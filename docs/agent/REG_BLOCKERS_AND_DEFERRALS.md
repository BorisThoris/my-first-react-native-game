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
