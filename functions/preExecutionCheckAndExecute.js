import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        try {
            await Deno.run({ cmd: [command, '--version'] }).status();
        } catch (e) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands.length > 0 ? unavailableCommands : null;
}

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock*'] }).status();
        await Deno.run({ cmd: ['sudo', 'dpkg', '--configure', '-a'] }).status();
    } catch (e) {
        console.error('Failed to clear apt locks:', e);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commandsToCheck = ['cat', 'grep', 'awk']; // essential commands
        const unavailableCommands = await checkCommandAvailability(commandsToCheck);
        if (unavailableCommands) {
            return Response.json({ error: 'Unavailable commands: ' + unavailableCommands.join(', ') }, { status: 400 });
        }

        await clearAptLocks(); // Ensure APT locks are clear before executing any task.

        // Your actual task execution logic goes here.
        
        return Response.json({ success: 'All checks passed, execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});