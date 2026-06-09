import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const results = {};
    for (const command of commands) {
        try {
            await Deno.run({ cmd: [command, '--version'] }).status();
            results[command] = { available: true, message: `${command} is available.` };
        } catch { 
            results[command] = { available: false, message: `${command} is not available.` };
        }
    }
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'cp', 'mv']; // critical commands
    const commandAvailability = await checkCommandAvailability(commandsToCheck);
    // Log results for observability
    console.log('Command Availability Check:', commandAvailability);
    return Response.json(commandAvailability);
});