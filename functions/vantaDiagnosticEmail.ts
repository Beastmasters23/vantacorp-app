import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Allow both user-initiated and service-role (scheduler/automation) calls
        const user = await base44.auth.me().catch(() => null);

        const { to_user_id, subject, body } = await req.json();

        if (!to_user_id || !subject || !body) {
            return Response.json({ error: 'to_user_id, subject, and body are required' }, { status: 400 });
        }

        // Directly invoke the sendTrustedMessage internal function (if callable by service role)
        // Note: this assumes 'sendTrustedMessage' is available via base44.functions.invoke or a direct integration.
        // If it's a top-level function, it might need to be called differently or replicated.
        const sendTrustedMessageResult = await base44.asServiceRole.functions.invoke('sendTrustedMessage', {
            to_user_id,
            subject,
            body
        });

        // Log the full result for diagnostics
        await base44.asServiceRole.entities.VantaHealingLog.create({
            trigger: "vantaDiagnosticEmail",
            status: sendTrustedMessageResult?.data?.success ? "Clean" : "Failed",
            summary: `Diagnostic test of sendTrustedMessage. Success: ${sendTrustedMessageResult?.data?.success || false}`,
            original_code: JSON.stringify({ to_user_id, subject, body }),
            issues_found: sendTrustedMessageResult?.data?.error ? [{ severity: "error", description: sendTrustedMessageResult.data.error, fix: "Requires manual investigation of sendTrustedMessage internal logic." }] : [],
            fixed_code: JSON.stringify(sendTrustedMessageResult) // Store the full response
        });

        return Response.json(sendTrustedMessageResult);

    } catch (error) {
        // Log any unexpected errors
        await base44.asServiceRole.entities.VantaHealingLog.create({
            trigger: "vantaDiagnosticEmail_exception",
            status: "Failed",
            summary: `Exception during sendTrustedMessage diagnostic: ${error.message}`,
            issues_found: [{ severity: "error", description: error.message, fix: "Requires investigation of the diagnostic function's error handling." }],
            original_code: JSON.stringify(req.json().catch(() => ({}))), // Attempt to stringify the request body if possible
        });
        return Response.json({ error: error.message }, { status: 500 });
    }
});