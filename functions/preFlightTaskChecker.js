import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemHealth() {
    // Check for existing APT locks
    try {
        const result = await Deno.run({
            cmd: ['bash', '-c', 'sudo lsof /var/lib/dpkg/lock']
        });
        const { success } = await result.status();
        if (success) return false; // APT lock is present
    } catch (error) {
        console.error("Error checking for APT locks:", error);
    }
    // Additional health checks can be implemented here.
    return true; // System is healthy
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isHealthy = await checkSystemHealth();
        if (!isHealthy) {
            return Response.json({ error: 'System health check failed or APT lock present.' }, { status: 503 });
        }
        // Proceed with the task execution
        // ... task execution logic goes here ...
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});