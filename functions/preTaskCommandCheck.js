import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const necessaryCommands = ['cat', 'echo']; // List essential commands here
    const aptLockFile = '/var/lib/dpkg/lock-frontend';

    async function clearAptLocks() {
        try {
            await Deno.remove(aptLockFile);
            console.log('APT locks cleared.');
        } catch (error) {
            console.error('Failed to clear APT locks:', error.message);
        }
    }

    async function checkCommands() {
        for (const cmd of necessaryCommands) {
            const commandExists = await Deno.run({
                cmd: ['which', cmd],
                stdout: 'piped'
            }).output();
            if (!new TextDecoder().decode(commandExists).trim()) {
                console.error('Command not found:', cmd);
                return false;
            }
        }
        return true;
    }

    try {
        await clearAptLocks();
        const commandsAvailable = await checkCommands();

        if (!commandsAvailable) {
            return Response.json({ error: 'Essential commands are missing.' }, { status: 500 });
        }

        // Proceed with the task execution after pre-checks
        return Response.json({ success: 'Pre-execution checks passed, tasks can proceed.' }, { status: 200 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});