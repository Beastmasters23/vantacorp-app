import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommands(neededCommands) {
    const missingCommands = [];
    for (const command of neededCommands) {
        const { success } = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (!success) missingCommands.push(command);
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'rm', 'echo']; // Add commands that are frequently used
    const missingCommands = await checkCommands(commandsToCheck);
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands detected', commands: missingCommands }, { status: 400 });
    }

    try {
        // Main task execution logic can go here.
        // For example, running a specific task that relies on these commands.
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ status: 'success' });
});