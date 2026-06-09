import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'apt-get', 'clean'] }).status();
    } catch { 
        console.error('Failed to clear APT locks');
    }
}

async function checkCommands(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        const status = await Deno.run({ cmd: ['which', cmd'], stdio: 'null' }).status();
        if (!status.success) {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo', 'grep']; // Add essential commands here
    try {
        await clearAptLocks();
        const missing = await checkCommands(requiredCommands);
        if (missing.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missing.join(', ') }, { status: 500 });
        }
        // Proceed with task execution
        // Placeholder for actual task logic here
        return Response.json({ message: 'All checks passed, executing task.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});