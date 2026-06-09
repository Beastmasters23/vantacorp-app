import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndLogCommandAvailability(command) {
    try {
        const result = await Deno.run({
            cmd: [command, '--version'],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        return new TextDecoder().decode(result).trim();
    } catch (error) {
        console.error(`Command ${command} not available: ${error.message}`);
        return null;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'python', 'node']; // Add more commands as needed
    const commandAvailabilityLog = {};

    for (const command of commandsToCheck) {
        commandAvailabilityLog[command] = await checkAndLogCommandAvailability(command);
    }

    console.log('Command Availability Log:', commandAvailabilityLog);
    return Response.json(commandAvailabilityLog);
});