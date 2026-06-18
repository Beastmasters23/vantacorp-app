import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const { exec } = Deno;
    try {
        await exec(`command -v ${command}`);
        return true;
    } catch (error) {
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['netstat', 'systemctl']; // Add any other critical commands
    const unavailableCommands = [];

    for (const command of commandsToCheck) {
        const isAvailable = await checkCommandAvailability(command);
        if (!isAvailable) {
            unavailableCommands.push(command);
        }
    }

    if (unavailableCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + unavailableCommands.join(', ') }, { status: 500 });
    }

    return Response.json({ message: 'All critical commands are available.' });
});