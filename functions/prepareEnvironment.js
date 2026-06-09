import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend']
    }).status();
    return result.success;
}

async function checkCommandAvailable(command) {
    const result = await Deno.run({
        cmd: ['which', command]
    }).status();
    return result.success;
}

async function prepareEnvironment() {
    const aptCleared = await clearAptLocks();
    const commandsToCheck = ['cat', 'bash', 'sudo'];
    const commandsAvailable = await Promise.all(commandsToCheck.map(checkCommandAvailable));
    return aptCleared && commandsAvailable.every(Boolean);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const environmentReady = await prepareEnvironment();
        if (!environmentReady) {
            throw new Error('Environment preparation failed: APT locks still present or commands missing.');
        }
        return Response.json({ message: 'Environment ready for task execution.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});