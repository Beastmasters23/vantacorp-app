import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForMissingCommands(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const cmdExists = await Deno.run({
            cmd: ['command', '-v', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (cmdExists.code !== 0) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'echo', 'ls']; // Add essential commands here
    try {
        const missing = await checkForMissingCommands(commandsToCheck);
        if (missing.length > 0) {
            console.error('Missing Commands:', missing);
            return Response.json({ error: 'Some required commands are missing: ' + missing.join(', ') }, { status: 500 });
        }
        // proceed with actual tasks...
        return Response.json({ message: 'All commands present, proceeding with tasks...' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});