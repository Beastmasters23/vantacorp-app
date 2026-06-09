import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    const requiredCommands = ['ls', 'cd', 'cat', 'echo'];
    const availableCommands = await checkAvailableCommands(requiredCommands);

    if (availableCommands.length > 0) {
        return Response.json({ error: 'Missing commands', commands: availableCommands }, { status: 400 });
    }

    try {
        // Proceed with task execution here
    } catch (error) {
        console.error('Task execution failed:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAvailableCommands(commands) {
    const unavailable = [];
    for (const command of commands) {
        const available = await checkCommand(command);
        if (!available) {
            unavailable.push(command);
        }
    }
    return unavailable;
}

async function checkCommand(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null'
    });
    const status = await process.status();
    return status.success;
}