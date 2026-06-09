import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCmdAvailability(command) {
    const cmd = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await cmd.output();
    cmd.close();
    return output.length > 0;
}

async function clearAptLocks() {
    // Assume we have a command to clear apt locks, e.g., 'sudo rm /var/lib/dpkg/lock-frontend'
    const cmd = Deno.run({
        cmd: ['sudo', 'rm', '/var/lib/dpkg/lock-frontend'],
        stderr: 'piped',
    });
    const output = await cmd.status();
    cmd.close();
    return output.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'sudo']; // Add necessary commands here
    for (const command of commandsToCheck) {
        const available = await checkCmdAvailability(command);
        if (!available) {
            return Response.json({ error: `${command} is not available` }, { status: 500 });
        }
    }

    const aptLockCleared = await clearAptLocks();
    if (!aptLockCleared) {
        return Response.json({ error: 'Failed to clear apt locks' }, { status: 500 });
    }

    // Assuming task logic here

    return Response.json({ message: 'Task executed successfully' });
});