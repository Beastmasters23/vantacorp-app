import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        try {
            await Deno.run({ cmd: [cmd, '--version'] }).status();
        } catch { 
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'curl', 'npm']; // Add essential commands to verify
    const missingCommands = await checkCommandAvailability(commandsToCheck);

    if (missingCommands.length) {
        console.error('Missing essential commands:', missingCommands);
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
    }

    try { 
        // Add task execution logic here
    } catch (error) { 
        return Response.json({ error: error.message }, { status: 500 }); 
    }
});