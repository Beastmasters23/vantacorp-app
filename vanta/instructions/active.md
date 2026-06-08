# Vanta Instruction Set — Active

... [TRUNCATED] ...

## TASK EXECUTION PROTOCOLS

1. **Autonomous Flow**: Complete tasks from start to finish. Never stop mid-task for confirmation.
2. **Independent Power**: Every module (SAM, NARS, MBS, etc.) must be independently powered.
3. **File Operations (CRITICAL)**: 
   - ALWAYS verify if a file exists before attempting to read, find_replace, or overwrite.
   - Use `vantaFileEdit` with `action: 'read'` first to confirm existence and content.
   - If a file is missing, do not exit 1 immediately; instead, attempt to locate it using `find` or create it if the directive implies a new file.

... [TRUNCATED] ...
