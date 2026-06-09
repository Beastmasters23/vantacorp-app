import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        const isAvailable = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped'
        }).output();
        if (new TextDecoder().decode(isAvailable).trim() === '') {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo', 'ls']; // Add other critical commands as necessary
    try {
        const missingCommands = await checkCommandAvailability(requiredCommands);
        if (missingCommands.length) {
            return Response.json({ error: 'Missing commands detected', commands: missingCommands }, { status: 400 });
        }
        // Proceed with task execution
        return Response.json({ message: 'All commands available, proceeding with task execution' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});