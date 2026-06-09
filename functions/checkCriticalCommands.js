import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const failedCommands = [];
    for (const command of commands) {
        const commandExist = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null'
        }).status();
        if (!commandExist.success) {
            failedCommands.push(command);
        }
    }
    return failedCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const criticalCommands = ['cat', 'ls', 'echo']; // Add other critical commands as needed
    const missingCommands = await checkCommandAvailability(criticalCommands);
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
    }
    return Response.json({ message: 'All critical commands are available.' });
});