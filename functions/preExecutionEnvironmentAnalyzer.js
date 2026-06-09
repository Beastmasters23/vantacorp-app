import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const lockStatus = await Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -v /var/lib/dpkg/lock; sudo fuser -v /var/lib/dpkg/lock-frontend'],
        stdout: 'piped',
        stderr: 'piped'
    });

    const { code } = await lockStatus;
    if (code !== 0) {
        // Attempt to clear any locks
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'], });
    }
}

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        const status = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await status;
        if (code !== 0) {
            console.warn(`Command ${command} is missing or not accessible.`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'curl', 'ls'];
    try {
        // Clear APT locks
        await clearAptLocks();

        // Check command availability
        const commandsAvailable = await checkCommandAvailability(requiredCommands);
        if (!commandsAvailable) {
            return Response.json({ error: 'Essential commands are missing.' }, { status: 500 });
        }

        // Proceed with the main task logic here

        return Response.json({ success: 'Environment verified, proceeding with task.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});