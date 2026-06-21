import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const results = {};
    for (const command of commands) {
        try {
            await Deno.run({ cmd: [command, '--version'] }).status();
            results[command] = true;
        } catch {
            results[command] = false;
        }
    }
    return results;
}

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock-frontend'] }).status();
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'] }).status();
    } catch (
        { message }
    ) {
        console.error('Failed to clear apt locks:', message);
        throw new Error('Failed to clear apt locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const essentialCommands = ['cat', 'echo', 'ls'];
        const commandAvailability = await checkCommandAvailability(essentialCommands);

        for (const command in commandAvailability) {
            if (!commandAvailability[command]) {
                console.error(`Missing command: ${command}`);
                return Response.json({ error: `Missing command: ${command}` }, { status: 500 });
            }
        }

        await clearAptLocks();
        return Response.json({ message: 'All checks passed and apt locks cleared.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});