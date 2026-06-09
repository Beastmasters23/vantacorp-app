import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkEnvironment() {
    const { exec } = Deno;
    try {
        // Check for APT locks
deno.lock({});
        await exec('sudo lsof /var/lib/apt/lists/lock');
        return { aptLocked: true };
    } catch (err) {
        // No APT lock detected
        return { aptLocked: false };
    }
}

async function verifyCommandsNeeded(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        try {
            await exec(`command -v ${cmd}`);
        } catch (error) {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'grep']; // List of necessary commands
    try {
        const { aptLocked } = await checkEnvironment();
        if (aptLocked) {
            return Response.json({ error: 'APT lock detected, cannot proceed.' }, { status: 503 });
        }
        const missingCommands = await verifyCommandsNeeded(commandsToCheck);
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 503 });
        }
        return Response.json({ status: 'Environment check passed, ready for task execution.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});