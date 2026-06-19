import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'apt-get', 'clean'] }).status();
        await Deno.run({ cmd: ['sudo', 'apt-get', 'update'] }).status();
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
    }
}

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        const status = await Deno.run({ cmd: ['which', command] }).status();
        if (status.code !== 0) {
            console.error(`Command not found: ${command}`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'grep', 'curl']; // Add other essential commands here

    await clearAptLocks();
    const areCommandsAvailable = await checkCommandAvailability(commands);
    if (!areCommandsAvailable) {
        return Response.json({ error: 'Essential commands are not available.' }, { status: 500 });
    }

    // Proceed with task execution
    return Response.json({ message: 'Pre-flight check passed. Task can proceed.' });
});