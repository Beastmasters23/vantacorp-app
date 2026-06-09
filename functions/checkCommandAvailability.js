import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const { exec } = Deno;
    try {
        const { code } = await exec(`command -v ${command}`);
        return code === 0;
    } catch (error) {
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'echo']; // Add any critical commands needed
    const availabilityResults = {};

    for (const command of commandsToCheck) {
        availabilityResults[command] = await checkCommandAvailability(command);
    }

    const unavailableCommands = Object.entries(availabilityResults).filter(([_, available]) => !available);
    if (unavailableCommands.length > 0) {
        return Response.json({ error: 'Critical commands missing.', details: unavailableCommands }, { status: 500 });
    }

    return Response.json({ message: 'All critical commands are available.' });
});