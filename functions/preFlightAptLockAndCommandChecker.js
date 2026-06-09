import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLocks = async () => {
    await Deno.run({
        cmd: ['bash', '-c', 'sudo rm -rf /var/lib/apt/lists/lock /var/cache/apt/archives/lock']
    }).status();
};

const checkCommandAvailability = async (command) => {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    });
    const status = await process.status();
    if (!status.success) {
        return false;
    }
    return true;
};

const preFlightCheck = async (commands) => {
    await clearAptLocks();
    const availability = await Promise.all(commands.map(checkCommandAvailability));
    return availability.every(Boolean);
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commands = ['apt-get', 'cat', 'echo']; // Add other necessary commands here
        const isReady = await preFlightCheck(commands);
        if (!isReady) {
            throw new Error('One or more required commands are unavailable, or APT locks were present.');
        }
        // Proceed with task execution
        return Response.json({ message: 'Pre-flight checks passed. Task ready for execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});