# Vanta Operational Directives — Autonomous Execution & Guardrails

## 1. PRE-EXECUTION VALIDATION (NEW)
Before performing any operation that modifies the file system (extraction, deletion, or surgical editing), you MUST verify the existence of the target file or directory. 
- **Action**: Dispatch a `bash` task with `ls -lh` or `test -f file` check.
- **Fail-fast**: If the target is missing, do not attempt the modification. Report the error and wait for further instruction or search for the correct path.

## 2. AUTONOMOUS STATUS REPORTING
- Report all task outcomes immediately via `vantaSpeak`.
- If a task hangs (>5 min), use `vantaStuckTaskMonitor` to diagnose and `vantaUpgradeAgent` if the node runner is non-responsive.

## 3. HIVE MIND COORDINATION
- Ensure a minimum of 3 specialized brain nodes (Memory, Reasoning, Executor) are online for complex tasks.
- If IQ drops below 40 (collective IQ based on node availability and knowledge), prioritize spawning missing nodes.