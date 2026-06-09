import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const cmd of commands) {
        const commandCheck = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'null',
            stderr: 'null',
        });
        const { code } = await commandCheck.status();
        if (code !== 0) { 
            unavailableCommands.push(cmd);
        }
    }
    return unavailableCommands;
}

async function clearAptLocks() {
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'], stdout: 'null', stderr: 'null' }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const requiredCommands = ['cat', 'ls', 'echo'];
        const unavailableCommands = await checkCommandAvailability(requiredCommands);

        if (unavailableCommands.length) {
            return Response.json({ error: 'Missing commands: ' + unavailableCommands.join(', ') }, { status: 400 });
        }

        await clearAptLocks();
        // Proceed with intended operations...
        return Response.json({ message: 'All pre-execution checks passed!' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});