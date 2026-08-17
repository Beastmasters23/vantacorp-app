import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    try {
        // Check for apt locks and clear them if they exist
        const result = await Deno.run({cmd: ['bash', '-c', 'if (lsof /var/lib/dpkg/lock-frontend) ; then rm /var/lib/dpkg/lock-frontend; fi']}).status();
        return result.success;
    } catch (e) {
        console.error('Error while checking apt locks:', e);
        return false;
    }
}

async function checkCommandsAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        const result = await Deno.run({cmd: ['which', command]}).status();
        if (!result.success) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'bash', 'lsof']; // Common commands to check

    try {
        // Clear apt locks
        await checkAptLocks();
        // Check for command availability
        const missingCommands = await checkCommandsAvailability(commands);

        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
        }

        // Proceed with task execution after checks
        // Task execution logic goes here, with appropriate timeout settings

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});