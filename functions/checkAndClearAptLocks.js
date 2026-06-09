import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const aptLocks = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock'],
    });
    const status = await aptLocks.status();
    return status.success;
}

async function checkCommandAvailability(command) {
    const commandCheck = Deno.run({
        cmd: ['bash', '-c', `command -v ${command}`],
    });
    const status = await commandCheck.status();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commandsToCheck = ['cat', 'otherCommand']; // Add commands needed for specific tasks
        const allCommandsAvailable = await Promise.all(commandsToCheck.map(checkCommandAvailability));
        const allCommandsSuccess = allCommandsAvailable.every(success => success);

        if (!allCommandsSuccess) {
            throw new Error('One or more required commands are not available.');
        }

        const aptLockCleared = await clearAptLocks();
        if (!aptLockCleared) {
            throw new Error('Failed to clear APT locks.');
        }

        return Response.json({ message: 'Environment ready for task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});