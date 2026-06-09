import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    // Check for apt locks and clear them if found
    const lockFilePath = '/var/lib/dpkg/lock';
    try {
        const response = await Deno.run({
            cmd: ['sh', '-c', `if [ -f ${lockFilePath} ]; then sudo rm -f ${lockFilePath}; fi`],
            stdout: 'null',
            stderr: 'inherit'
        });
        await response.status();
    } catch (error) {
        console.error('Error clearing apt lock:', error);
    }
}

async function validateCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        const response = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'inherit'
        });
        if (response.status() !== 0) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        const commands = ['cat', 'ls', 'rm', 'echo']; // Example commands that might be used
        const missingCommands = await validateCommandAvailability(commands);
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
        }
        return Response.json({ message: 'Pre-execution check completed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});