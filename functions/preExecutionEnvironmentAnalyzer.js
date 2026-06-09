import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const { stdout } = await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean'],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        return new TextDecoder().decode(stdout);
    } catch (error) {
        throw new Error('Failed to clear APT locks: ' + error.message);
    }
}

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        const { code } = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'null',
            stderr: 'null'
        }).status();
        if (code !== 0) missingCommands.push(cmd);
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'echo', 'grep'];
    try {
        // Clear APT locks
        await clearAptLocks();
        // Check for essential commands
        const missingCommands = await checkCommandAvailability(essentialCommands);
        if (missingCommands.length) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
        }
        return Response.json({ message: 'Environment pre-check complete.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});