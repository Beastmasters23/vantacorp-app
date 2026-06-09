import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    await exec('sudo fuser -k /var/lib/dpkg/lock');
    await exec('sudo fuser -k /var/lib/apt/lists/lock');
    await exec('sudo fuser -k /var/cache/apt/archives/lock');
}

async function checkCommandAvailability(commands) {
    const { exec } = Deno;
    for (const command of commands) {
        const { code } = await exec(`command -v ${command}`);
        if (code !== 0) {
            throw new Error(`Command not found: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear APT locks
        await clearAptLocks();

        // Check for essential commands
        await checkCommandAvailability(['cat', 'curl', 'echo']);

        // Continue with other task executions...
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});