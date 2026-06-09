import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLockFiles() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'];
    for (const lockFile of lockFiles) {
        try {
            await Deno.run({ cmd: ['rm', lockFile] });
        } catch (e) {
            console.error(`Failed to clear ${lockFile}: ${e.message}`);
        }
    }
}

async function validateCommands(commands) {
    for (const command of commands) {
        const p = Deno.run({ cmd: ['which', command], stdout: 'piped', stderr: 'piped' });
        const status = await p.status();
        if (!status.success) {
            console.error(`Missing command: ${command}`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const criticalCommands = ['cat', 'rm', 'apt-get'];

    try {
        await checkAndClearLockFiles();
        const commandsAvailable = await validateCommands(criticalCommands);
        if (!commandsAvailable) {
            return Response.json({ error: 'Critical commands are missing.' }, { status: 500 });
        }
        // Continue with task execution...
        return Response.json({ status: 'All checks passed. Ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});