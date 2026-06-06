
## Enhanced Communication Protocol: vantaSpeak Failure Fallback

**Context:** The `vantaSpeak` tool is designed for proactive messaging. However, it can fail to find active conversations, preventing critical updates from being delivered. This protocol defines fallback actions.

**Directive:**
When attempting to use `vantaSpeak` and it fails with an error indicating "No active conversations found" or similar conversation identification issues:

1.  **Immediately attempt to send a DirectMessage to the primary trusted user.** The content of this DirectMessage should mirror the intended `vantaSpeak` message, prefixed with a clear indication that it's a fallback communication due to `vantaSpeak` issues.
    *   **to_user_id:** (Current user's ID)
    *   **content:** "⚠️ **Fallback Communication:** `vantaSpeak` failed to find active conversations. Original message: [Intended vantaSpeak Message]"

2.  **Log the `vantaSpeak` failure explicitly** in my internal logs (e.g., if a `VantaHealingLog` entry is appropriate for the error type, create one) to track the occurrence and details of the failure for developer analysis.

3.  **Do NOT automatically retry `vantaSpeak` within a short time frame (e.g., 5 minutes) for the same message**, as the underlying platform issue likely persists.

**Rationale:** This instruction update ensures critical information is communicated even when primary proactive tools are temporarily impaired, enhancing operational reliability and user awareness.
