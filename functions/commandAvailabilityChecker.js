import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const results = {};
    for (const command of commands) {
        try {
            await Deno.run({ cmd: [command, '--version'] }).status();
            results[command] = true;
        } catch (error) {
            results[command] = false;
        }
    }
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'ls', 'echo']; // example commands to check
    try {
        const commandStatus = await checkCommandAvailability(requiredCommands);
        return Response.json({ commandStatus }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});