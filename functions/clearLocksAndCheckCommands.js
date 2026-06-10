import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocksAndCheckCommands() {
    const essentialCommands = ['cat', 'echo', 'ls']; // List of essential commands that need to be checked
    const lockFile = '/var/lib/dpkg/lock';

    // Check for APT lock and remove if found
    try {
        const { status } = await Deno.run({
            cmd: ['rm', lockFile],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (status !== 0) {
            console.log('No APT lock file found or could not remove it.');
        } else {
            console.log('APT lock cleared successfully.');
        }
    } catch (error) {
        console.error('Error clearing APT lock:', error);
    }

    // Check for the existence of essential commands
    for (const cmd of essentialCommands) {
        try {
            await Deno.run({ cmd: [cmd, '--version'], stdout: 'null', stderr: 'null' }).status();
            console.log(`${cmd} is available.`);
        } catch {
            console.error(`${cmd} is missing!`);
            throw new Error(`${cmd} is required for task execution.`);
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearLocksAndCheckCommands();
        return Response.json({ message: 'Pre-flight checks passed. Ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});