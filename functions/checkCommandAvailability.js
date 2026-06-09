import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const exec = Deno.run;
    const results = await Promise.all(commands.map(async (command) => {
        try {
            const process = exec({ cmd: [command, '--version'], stdout: 'null', stderr: 'null' });
            const { code } = await process.status();
            return { command, available: code === 0 };
        } catch (error) {
            return { command, available: false };
        }
    }));
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['CAT', 'ls', 'echo']; // Add critical commands to check
    const commandChecks = await checkCommandAvailability(commandsToCheck);
    const unavailableCommands = commandChecks.filter(check => !check.available);
    if (unavailableCommands.length > 0) {
        return Response.json({ error: 'Missing crucial commands', commands: unavailableCommands }, { status: 503 });
    }
    return Response.json({ message: 'All commands available.' });
});