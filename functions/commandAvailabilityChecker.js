import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await process.status();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'ls', 'echo']; // Add any other essential commands here
    const unavailableCommands = [];

    for (const command of commands) {
        const isAvailable = await checkCommandAvailability(command);
        if (!isAvailable) {
            unavailableCommands.push(command);
        }
    }

    if (unavailableCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + unavailableCommands.join(', ') }, { status: 500 });
    }

    // Here we can add retry logic for executing a call if needed based on previous retries count

    return Response.json({ status: 'All commands are available and ready to go.' });
});