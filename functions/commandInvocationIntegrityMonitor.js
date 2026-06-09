import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];

    for (const command of commands) {
        const process = Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null'
        });
        const status = await process.status();
        if (!status.success) {
            unavailableCommands.push(command);
        }
        process.close();
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'grep', 'echo']; // Add any other critical commands here.

    try {
        const unavailableCommands = await checkCommandAvailability(commandsToCheck);
        if (unavailableCommands.length > 0) {
            return Response.json({ error: 'Missing commands detected: ' + unavailableCommands.join(', ') }, { status: 500 });
        }
        // Proceed with task execution knowing that all commands are available.
        // ... [Insert task execution logic here]

        return new Response('Task executed successfully');
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});