import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped',
        }).output();

        if (result.length === 0) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

async function logCommandStatus(unavailableCommands) {
    if (unavailableCommands.length) {
        console.error('Unavailable commands:', unavailableCommands);
    } else {
        console.log('All commands are available.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'echo', 'ls']; // Add commands based on known failures

    try {
        const unavailableCommands = await checkCommandAvailability(commandsToCheck);
        await logCommandStatus(unavailableCommands);

        if (unavailableCommands.length) {
            return Response.json({ error: 'Missing commands: ' + unavailableCommands.join(', ') }, { status: 400 });
        }
        // Proceed with further task execution logic...

    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});