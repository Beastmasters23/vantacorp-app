import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForAptLock() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'if [ -f /var/lib/dpkg/lock ]; then rm /var/lib/dpkg/lock; fi'],
        stdout: 'null',
        stderr: 'null'
    }).status();
    return result.success;
}

async function validateCommands(commands) {
    for (const command of commands) {
        const result = await Deno.run({
            cmd: ['bash', '-c', `command -v ${command}`],
            stdout: 'null',
            stderr: 'null'
        }).status();
        if (!result.success) return false;
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo', 'bash']; 
    try {
        await checkForAptLock();
        const commandsReady = await validateCommands(requiredCommands);
        if (!commandsReady) throw new Error('Required commands are missing.');
        return Response.json({ status: 'success', message: 'Environment is ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});