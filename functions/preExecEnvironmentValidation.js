import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preExecCheck() {
    const { exec } = Deno;
    let aptLocked = false;
    let commandFails = [];

    // Check for APT locks
    try {
        await exec(['sudo', 'lsof', '/var/lib/dpkg/lock']);
        aptLocked = true;
    } catch { 
        aptLocked = false;
    }

    // Validate essential commands
    const commandsToCheck = ['cat', 'ls', 'echo'];
    for (const cmd of commandsToCheck) {
        try {
            await exec([cmd, '--help']);
        } catch {
            commandFails.push(cmd);
        }
    }

    return { aptLocked, commandFails };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const checks = await preExecCheck();
        return Response.json({ checks }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});