import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        const output = new TextDecoder().decode(result);
        if (!output.trim()) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo', 'mv'];  // Add more essential commands as needed
    try {
        const unavailable = await checkCommandAvailability(requiredCommands);
        if (unavailable.length > 0) {
            return Response.json({ error: 'Unavailable commands: ' + unavailable.join(', ') }, { status: 500 });
        }
        // Proceed with task execution...
        return Response.json({ message: 'All commands available, proceeding with task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});