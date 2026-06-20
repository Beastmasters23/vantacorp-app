import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndResolveLocks() {
    try {
        // Check for apt locks
        const lockFilePath = '/var/lib/dpkg/lock';
        const isLocked = await Deno.stat(lockFilePath).catch(() => false);
        if (isLocked) {
            console.error('APT is locked. Attempting to clear the lock.');
            await Deno.run({
                cmd: ['sudo', 'fuser', '-k', lockFilePath],
            }).status();
        }
    } catch (error) {
        console.error('Failed to resolve apt lock:', error);
    }
}

async function commandAvailabilityChecker(commands) {
    for (const command of commands) {
        const status = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped',
        }).status();
        if (status.code !== 0) {
            console.error(`Command not found: ${command}`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['apt-get', 'cat']; // Add all necessary commands here
    await checkAndResolveLocks();
    const areCommandsAvailable = await commandAvailabilityChecker(commandsToCheck);

    if (!areCommandsAvailable) {
        return Response.json({ error: 'One or more necessary commands are missing.' }, { status: 500 });
    }

    // Proceed with task execution
    return Response.json({ success: 'All checks passed. You can proceed with your task.' });
});