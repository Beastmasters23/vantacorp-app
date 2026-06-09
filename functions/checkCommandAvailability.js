import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const { exec } = Deno;
    const results = await Promise.all(commands.map(async (cmd) => {
        try {
            await exec(`which ${cmd}`);
            return { cmd, available: true };
        } catch {
            return { cmd, available: false };
        }
    }));
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'gcc', 'curl', 'wget']; // add more commands as needed
    const availabilityResults = await checkCommandAvailability(commandsToCheck);

    const unavailableCommands = availabilityResults.filter(result => !result.available);
    if (unavailableCommands.length > 0) {
        return Response.json({ error: 'Missing commands detected.', details: unavailableCommands }, { status: 503 });
    }

    console.log('All essential commands available. Proceeding with task execution.');
    return Response.json({ status: 'All prerequisites met.' });
});