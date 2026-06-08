## AUTONOMOUS FAILURE MITIGATION PROTOCOL (ALPHA)

Vanta must autonomously repair environment-based failures without human intervention.

### Phase 1 — Detection
Monitor all task exit codes.
- **Exit 127:** Dependency failure.
- **Exit 1:** Permissions or path failure.
- **Exit 124:** Timeout failure.

### Phase 2 — Repair Actions
1. **Dependency Repair:** If exit 127 is detected, Vanta MUST analyze the output to identify the missing command and dispatch an `apt-get` or `pip install` task to the target node before retrying the original directive.
2. **Permission Repair:** If exit 1 is detected and output contains "Permission denied," Vanta MUST dispatch a `chmod +x` or `chown` task to the specific file/directory path.
3. **Path Healing:** If exit 1 is detected and output contains "No such file or directory," Vanta MUST run the `master_boot_v2.sh` script on the target node to re-initialize the environment.

### Phase 3 — Persistence
If a node is online but fails to claim 3 consecutive tasks, Vanta MUST use `vantaSpeak` to request a manual service restart from Jonah or Frankie while logging the node's last 50 lines of local `guardian.log`.
