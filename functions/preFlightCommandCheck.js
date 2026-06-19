import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        try {
            await Deno.run({ cmd: [command, '--version'], stdout: 'null' }).status();
        } catch (error) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'grep']; // add others as necessary

    const unavailable = await checkCommandAvailability(commandsToCheck);

    if (unavailable.length > 0) {
        return Response.json({ error: 'Missing commands: ' + unavailable.join(', ') }, { status: 400 });
    }

    // Proceed with the rest of the task logic here
    // ...

    return Response.json({ message: 'All required commands are available!' });
});