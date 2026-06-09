import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preExecutionCheck() {
    // Check for APT locks
    const aptLocks = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser /var/lib/dpkg/lock']
    });
    const hasLocks = aptLocks.status().code === 0;

    // Check for essential commands
    const essentialCommands = ['cat', 'echo', 'ls'];
    const unavailableCommands = [];
    for (const command of essentialCommands) {
        const cmdResult = await Deno.run({
            cmd: ['bash', '-c', `command -v ${command}`]
        });
        if (cmdResult.status().code !== 0) {
            unavailableCommands.push(command);
        }
    }

    return { hasLocks, unavailableCommands };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { hasLocks, unavailableCommands } = await preExecutionCheck();
        if (hasLocks) {
            return Response.json({ error: 'APT locks are present. Please clear them before executing tasks.' }, { status: 503 });
        }
        if (unavailableCommands.length > 0) {
            return Response.json({ error: `Essential commands unavailable: ${unavailableCommands.join(', ')}` }, { status: 503 });
        }
        // Proceed with task execution here
        return Response.json({ message: 'Pre-execution checks passed. Tasks can now run.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});