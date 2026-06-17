import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CRITICAL_COMMANDS = ['cat', 'echo', 'rm', 'grep'];

async function checkCommandsAvailability() {
    const missingCommands = [];
    for (const cmd of CRITICAL_COMMANDS) {
        const isAvailable = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'null'
        }).status();
        if (isAvailable.code !== 0) {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const missingCommands = await checkCommandsAvailability();
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing critical commands', missingCommands }, { status: 400 });
        }

        // Proceed with the rest of your logic here, knowing critical commands are available.

        return Response.json({ message: 'All critical commands are available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});