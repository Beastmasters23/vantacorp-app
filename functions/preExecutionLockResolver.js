import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const aptStatus = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock 2>/dev/null; sudo fuser -k /var/lib/dpkg/lock-frontend 2>/dev/null; sudo fuser -k /var/cache/apt/archives/lock 2>/dev/null'],
        stdout: 'piped',
        stderr: 'piped'
    });
    return aptStatus.status.success;
}

async function checkCommandAvailable(command) {
    const cmdCheck = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
    });
    const output = new TextDecoder().decode(await cmdCheck.output());
    return output.length > 0;
}

async function preExecutionCheck(commandsToCheck) {
    const locksCleared = await clearAptLocks();
    if (!locksCleared) {
        throw new Error('Failed to clear apt locks, aborting task.');
    }
    for (const command of commandsToCheck) {
        const isAvailable = await checkCommandAvailable(command);
        if (!isAvailable) {
            throw new Error(`Command ${command} is not available in the system.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commandsToCheck = ['cat', 'echo', 'ls']; // Replace with necessary commands
        await preExecutionCheck(commandsToCheck);
        // Task execution logic goes here
        return Response.json({ message: 'All checks passed. Task can proceed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});