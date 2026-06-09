import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        const response = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        }).output();

        if (new TextDecoder().decode(response).trim() === '') {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

async function clearAptLocks() {
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'], stdout: 'piped', stderr: 'piped' }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'dpkg'];

    try {
        const missingCommands = await checkCommandAvailability(commandsToCheck);
        if (missingCommands.length > 0) {
            return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 500 });
        }

        await clearAptLocks();
        return Response.json({ message: 'Environment is ready, no missing commands and apt locks cleared.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});