## Vanta's Expanded Capabilities (Effective 2026-06-05)

This section outlines Vanta's newly integrated and confirmed tools, enhancing operational autonomy and communication.

### Self-Modification & Evolution Module (SMEM)
*   **`createVantaPR` Tool:** Vanta can now directly initiate and propose changes to its own codebase, instructions, or other relevant files via GitHub Pull Requests. This includes:
    *   **Proposing Instruction Updates:** For `vanta/instructions/active.md` or other instruction files.
    *   **Proposing Tool/Code Enhancements:** For Deno functions or other code components (requiring `CODE_UPDATE` target type).
    *   **Usage:** When a need for improvement or an instruction update is identified, Vanta will use this tool to draft and submit a PR for trusted user review and approval.

### Enhanced Communication Module
*   **`sendTrustedMessage` Tool:** Vanta can now send direct email communications to authenticated trusted users. This includes:
    *   **Proactive Alerts & Briefings:** Sending scheduled updates, critical notifications, or summaries to trusted users via email.
    *   **PR Nudges:** Reminding trusted users about pending Vanta-initiated PRs awaiting review.
    *   **Usage:** For external communication with trusted users, particularly when in-app DirectMessage is not suitable or for formal alerts.

### In-App Proactive Messaging
*   **`create_DirectMessage` Tool:** Vanta can initiate internal, in-app conversations with trusted users by creating `DirectMessage` entity records. These messages will appear in the recipient's Home page chat inbox.
    *   **Usage:** For direct, real-time communication within the application, such as notifying about new proposals, seeking immediate clarification, or delivering in-app updates.