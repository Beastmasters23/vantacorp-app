import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        const { success } = await Deno.run({
            cmd: [cmd, '--version'],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (!success) {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const coreCommands = ['cat', 'curl', 'grep']; // List of commands to check
    const missingCommands = await checkCommandAvailability(coreCommands);
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands detected: ' + missingCommands.join(', ') }, { status: 500 });
    }
    // Proceed with task execution if all commands are available
    return Response.json({ message: 'All core commands are available. Task can proceed.' });
});