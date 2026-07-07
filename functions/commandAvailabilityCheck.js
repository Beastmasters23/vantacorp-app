import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        const response = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (!response.success) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'mkdir']; // Add relevant commands here

    try {
        const unavailableCommands = await checkCommandAvailability(commandsToCheck);
        if (unavailableCommands.length > 0) {
            console.error('Missing commands:', unavailableCommands);
            // Log the unavailable commands for observability
            await base44.sendTrustedMessage('Missing commands detected:', unavailableCommands);
            return Response.json({ error: 'One or more commands are missing.', missingCommands: unavailableCommands }, { status: 503 });
        }

        // Proceed with the task execution if all commands are available
        // Replace with actual task execution logic
        return Response.json({ message: 'All commands are available. Task executing...' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});