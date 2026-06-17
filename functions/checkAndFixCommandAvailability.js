import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndFixCommandAvailability() {
    // Define a list of essential commands to check
    const essentialCommands = ['cat', 'mkdir', 'touch', 'ls', 'chmod'];
    const lockFiles = ['/var/lib/apt/lists/lock', '/var/cache/apt/archives/lock'];

    // Check for command availability and log missing ones
    const missingCommands = [];
    for (const command of essentialCommands) {
        const isAvailable = await Deno.run({
            cmd: ['which', command],
            status: {stdout: 'piped', stderr: 'piped'}
        });
        if (isAvailable.code !== 0) {
            missingCommands.push(command);
        }
    }

    // Clear apt locks if any exists
    for (const lockFile of lockFiles) {
        try {
            await Deno.remove(lockFile);
        } catch (e) {
            console.error(`Unable to remove lock file: ${lockFile}, error: ${e.message}`);
        }
    }

    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const missingCommands = await checkAndFixCommandAvailability();
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
        }
        return Response.json({ message: 'All commands available and locks cleared.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});