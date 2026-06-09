import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        const commandExists = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped',
        }).status();
        if (!commandExists.success) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['netstat', 'curl', 'grep'];
    try {
        const unavailableCommands = await checkCommandAvailability(requiredCommands);
        if (unavailableCommands.length > 0) {
            return Response.json({ error: `Missing commands: ${unavailableCommands.join(', ')}` }, { status: 400 });
        }
        // Continue with further task execution if all commands are available.
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});