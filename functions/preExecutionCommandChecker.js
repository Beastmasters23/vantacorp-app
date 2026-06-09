import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const availableCommands = [];
    for (const cmd of commands) {
        const output = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped',
            stderr: 'piped'
        }).output();

        const commandPath = new TextDecoder().decode(output).trim();
        if (commandPath) availableCommands.push(cmd);
    }
    return availableCommands;
}

async function checkPermissions(commands) {
    const permissionResults = {};
    for (const cmd of commands) {
        const output = await Deno.run({
            cmd: ['sudo', '-n', cmd],
            stdout: 'piped',
            stderr: 'piped'
        }).status();

        permissionResults[cmd] = output.success;
    }
    return permissionResults;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const criticalCommands = ['cat', 'ls', 'echo']; // Define necessary commands

    try {
        const availableCommands = await checkCommandAvailability(criticalCommands);
        const permissionChecking = await checkPermissions(availableCommands);

        if (availableCommands.length === 0) {
            return Response.json({ error: 'No critical commands available' }, { status: 500 });
        }

        return Response.json({ availableCommands, permissionChecking }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});