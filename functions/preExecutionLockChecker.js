import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'apt-get', 'clean'] }).status();
    } catch (e) { 
        console.error('Failed to clear APT locks', e);
    }
}

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        const status = await Deno.run({ cmd: ['which', command] }).status();
        if (status.code !== 0) {
            console.error(`Required command ${command} is not available.`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        const commands = ['cat', 'ls', 'echo'];
        const areCommandsAvailable = await checkCommandAvailability(commands);
        if (!areCommandsAvailable) {
            return Response.json({ error: 'Essential commands are missing.' }, { status: 500 });
        }
        // Proceed with task execution
        return Response.json({ message: 'Pre-checks cleared, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});