import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

let commandCache = {};

async function checkCommandAvailability(command) {
    if (commandCache[command] !== undefined) {
        return commandCache[command];
    } 
    try {
        const {stdout} = await Deno.run({
            cmd: ["which", command],
            stdout: "piped"
        }).output();
        const result = stdout.length > 0;
        commandCache[command] = result;
        return result;
    } catch (e) {
        commandCache[command] = false;
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ["cat", "echo", "ls"];  // Example commands to check

    const commandAvailabilityResults = await Promise.all(
        commandsToCheck.map(checkCommandAvailability)
    );

    return Response.json({
        commands: commandsToCheck,
        availability: commandAvailabilityResults
    });
});