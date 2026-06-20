import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAvailability() {
    const requiredCommands = ['cat', 'echo', 'mkdir', 'touch'];
    for (const cmd of requiredCommands) {
        const result = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped',
            stderr: 'null'
        }).output();
        if (!new TextDecoder().decode(result).trim()) {
            throw new Error(`Command not found: ${cmd}`);
        }
    }
}

async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock-frontend'],
        stderr: 'piped'
    }).status();
    if (!result.success) {
        throw new Error('Could not clear APT lock.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        await checkAvailability();
        // Proceed with task execution...
        return Response.json({ success: 'All checks passed, ready to execute task.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});