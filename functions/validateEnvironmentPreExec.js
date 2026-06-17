import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock; sudo fuser -k /var/lib/apt/lists/lock']
    }).status();
}

async function checkCommandAvailability(commands) {
    const results = await Promise.all(commands.map(async (cmd) => {
        const status = await Deno.run({ cmd: ['which', cmd'] }).status();
        return status.success;
    }));
    return results.every(Boolean);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'bash', 'grep']; // Add other essential commands as needed
    try {
        await clearAptLocks();

        const areCommandsAvailable = await checkCommandAvailability(requiredCommands);
        if (!areCommandsAvailable) {
            throw new Error('Some required commands are missing.');
        }

        // Proceed with the main task handling logic here
        return Response.json({ message: 'Environment is prepared for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});