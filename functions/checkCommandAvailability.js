import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const requiredCommands = ['cat', 'echo']; // List of essential commands to check

async function checkCommandAvailability() {
    const missingCommands = [];
    for (const command of requiredCommands) {
        const isAvailable = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        }).status();
        if (isAvailable.code !== 0) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const missingCommands = await checkCommandAvailability();
        if (missingCommands.length > 0) {
            console.error('Missing commands:', missingCommands);
            return Response.json({ error: 'Missing essential commands', missingCommands }, { status: 500 });
        }
        // Proceed with task execution when all commands are available
        return Response.json({ message: 'All essential commands are available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});