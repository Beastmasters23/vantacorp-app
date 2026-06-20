import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const cmd of commands) {
        const result = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (result.code !== 0) {
            unavailableCommands.push(cmd);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'rm', 'echo']; // Extend this array with all critical commands needed for your tasks
    const missingCommands = await checkCommandAvailability(commandsToCheck);

    if (missingCommands.length > 0) {
        return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 400 });
    }

    // Continue with the execution of the task after command validation.
    // Your existing task logic goes here.

    return Response.json({ message: 'All required commands are available. Proceeding with task...' });
});