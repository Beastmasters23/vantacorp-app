import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommands(commands) {
    for (const command of commands) {
        const { success } = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null'
        }).status();
        if (!success) {
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'ls', 'grep']; // Add more commands as necessary
    const areCommandsAvailable = await checkCommands(requiredCommands);

    if (!areCommandsAvailable) {
        return Response.json({ error: 'Essential commands are not available. Task execution aborted.' }, { status: 500 });
    }

    try {
        // Continue with task execution logic here
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});