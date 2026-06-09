import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandAndEnvSanityCheck() {
    const requiredCommands = ['cat', 'echo', 'ls']; // List of essential commands
    const missingCommands = [];

    for (const cmd of requiredCommands) {
        const commandCheck = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'null',
            stderr: 'piped'
        });
        const { code } = await commandCheck.status();
        if (code !== 0) {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const missingCommands = await commandAndEnvSanityCheck();
        if (missingCommands.length > 0) {
            // Log missing commands for operator visibility
            console.error(`Missing commands found: ${missingCommands.join(', ')}`);
            return Response.json({ error: 'Missing commands detected.', details: missingCommands }, { status: 400 });
        }
        // Proceed with the task execution logic if all commands are available
        return Response.json({ message: 'All commands are available. Proceeding with execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});