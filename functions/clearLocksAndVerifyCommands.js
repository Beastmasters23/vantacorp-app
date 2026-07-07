import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocksAndVerifyCommands() {
    // Check and clear APT locks
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock', '/var/cache/apt/archives/lock', '/var/lib/dpkg/lock*'] }).status();

    // Verify essential commands
    const commands = ['cat', 'ls', 'grep']; // add more critical commands as necessary
    for (const command of commands) {
        try {
            await Deno.run({ cmd: [command, '--version'] }).status();
        } catch {
            throw new Error(`Required command ${command} not found`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearLocksAndVerifyCommands();
        return Response.json({ message: 'Pre-flight checks passed!' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});