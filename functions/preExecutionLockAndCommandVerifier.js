import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLocks() {
    // Pseudo-code to check and clear APT locks
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo rm /var/lib/dpkg/lock; sudo rm /var/lib/apt/lists/lock; sudo rm /var/cache/apt/archives/lock']
    });
    return result.status === 0;
}

async function checkCommandAvailability(commands) {
    const missing = [];
    for (const cmd of commands) {
        const result = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`]
        });
        if (result.status !== 0) {
            missing.push(cmd);
        }
    }
    return missing;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'echo', 'bash'];  // Add more if needed
    let response = { success: false, issues: [] };

    try {
        // Check and clear locks
        const lockCleared = await checkAndClearLocks();
        if (!lockCleared) {
            response.issues.push({ description: 'Failed to clear APT locks', severity: 'high' });
        }

        // Check for essential commands availability
        const missingCommands = await checkCommandAvailability(essentialCommands);
        if (missingCommands.length > 0) {
            response.issues.push({ description: `Missing commands: ${missingCommands.join(', ')}`, severity: 'medium' });
        }

        response.success = true;
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(response);
});