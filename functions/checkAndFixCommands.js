import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndFixCommands() {
    const commands = ['cat', 'python']; // Add more critical commands as needed
    const commandStatus = {};
    for (const cmd of commands) {
        const response = await fetch(`/check-command?cmd=${cmd}`);
        commandStatus[cmd] = response.ok ? 'available' : 'not available';
        if (response.status !== 200) {
            console.error(`Command check failed: ${cmd} - ${response.statusText}`);
        }
    }
    return commandStatus;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commandStatus = await checkAndFixCommands();
        return Response.json({ commandStatus }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});