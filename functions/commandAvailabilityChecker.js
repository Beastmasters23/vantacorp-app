import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        const exists = await Deno.run({
            cmd: ['command', '-v', cmd],
            stdout: 'piped',
            stderr: 'null'
        }).output();
        if (new TextDecoder().decode(exists).trim() === '') {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'echo', 'rm'];  // Add essential commands here
    const missingCommands = await checkCommandAvailability(commandsToCheck);

    if (missingCommands.length > 0) {
        // Log the missing commands
        console.error('Missing commands:', missingCommands);
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
    }

    try {
        // Proceed with executing the task
        // ... (Task execution logic goes here)
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});