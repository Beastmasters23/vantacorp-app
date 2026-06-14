import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = commands.filter(cmd => !await commandExists(cmd));
    if (missingCommands.length > 0) {
        throw new Error(`Missing commands: ${missingCommands.join(', ')}`);
    }
}

async function commandExists(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null',
    });
    const { code } = await process.status();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'grep']; // Add essential commands
    try {
        await checkCommandAvailability(commandsToCheck);
        // Proceed with task execution
        // ... (Add task execution logic here)
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});