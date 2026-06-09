import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const { exec } = Deno;
    try {
        await exec(`command -v ${command}`);
        return true;
    } catch {
        return false;
    }
}

async function checkEnvironment() {
    const essentialCommands = ['cat', 'grep', 'curl'];  // List essential commands
    const unavailableCommands = [];

    for (const command of essentialCommands) {
        const isAvailable = await checkCommandAvailability(command);
        if (!isAvailable) {
            unavailableCommands.push(command);
        }
    }

    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const unavailableCommands = await checkEnvironment();
        if (unavailableCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + unavailableCommands.join(', ') }, { status: 500 });
        }
        // Continue with task execution...
        return Response.json({ message: 'All essential commands are available.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});