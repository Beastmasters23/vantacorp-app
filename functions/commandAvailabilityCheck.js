import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        try {
            await Deno.run({ cmd: ['which', cmd'] }).status();
        } catch { 
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const commandsToCheck = ['cat', 'ls', 'grep']; // List critical commands to check
    const missingCommands = await checkCommandAvailability(commandsToCheck);

    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
    }
    // Proceed with task execution if all commands are available
    return Response.json({ message: 'All commands are available, ready to execute tasks.' });
});