import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkEnvironment() {
    const { exec } = Deno;
    try {
        const { success } = await exec('apt -q -y update');
        if (!success) return 'APT lock detected, please check manually.';
    } catch (error) {
        return 'Command availability check failed: ' + error.message;
    }
    return 'Environment is healthy.';
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const healthCheckResult = await checkEnvironment();
        return Response.json({ message: healthCheckResult });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});