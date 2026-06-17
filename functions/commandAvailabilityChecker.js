import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        try {
            await Deno.run({ cmd: [command], stdout: 'null', stderr: 'null' }).status();
        } catch (error) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'bash', 'grep']; // Add any other critical commands here.
    const unavailableCommands = await checkCommandAvailability(essentialCommands);
    
    if (unavailableCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + unavailableCommands.join(', ') }, { status: 500 });
    }
    // Proceed with the rest of the task execution safely.
    return Response.json({ message: 'All critical commands are available.' });
});