import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const commandPromises = commands.map(cmd => Deno.run({
        cmd: ['which', cmd],
        stdout: 'null',
        stderr: 'null'
    }).status());
    const results = await Promise.all(commandPromises);
    return results.every(result => result.success);
}

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock', '/var/cache/apt/archives/lock', '/var/lib/apt/lists/lock'], stdout: 'null', stderr: 'null' }).status();
    } catch (error) {
        console.error('Error clearing apt locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'ls', 'echo'];  // Add required commands here
    try {
        const commandsAvailable = await checkCommandAvailability(requiredCommands);
        if (!commandsAvailable) {
            return Response.json({ error: 'One or more required commands are missing.' }, { status: 500 });
        }
        await clearAptLocks();
        // Proceed with task execution
        return Response.json({ success: 'Pre-check completed successfully, ready for execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});