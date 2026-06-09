import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandAvailabilityCheck(commands) {
    const missingCommands = [];
    for(const cmd of commands) {
        try {
            await Deno.run({ cmd: [cmd, '-v'] }).status();
        } catch {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

async function checkPermissions() {
    try {
        await Deno.run({ cmd: ['whoami'] }).status();
    } catch {
        return false;
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'grep', 'awk']; // Add more commands as needed

    try {
        const missingCommands = await commandAvailabilityCheck(commandsToCheck);
        const hasPermissions = await checkPermissions();

        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
        }
        if (!hasPermissions) {
            return Response.json({ error: 'Insufficient permissions to execute tasks.' }, { status: 403 });
        }

        // Proceed with further task processing...
        return Response.json({ success: 'All checks passed!' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});