import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const result = await Deno.run({
            cmd: ['bash', '-c', 'sudo apt-get clean && sudo rm /var/lib/apt/lists/* -vf && sudo apt-get update'],
            stdout: 'inherit',
            stderr: 'inherit'
        }).status();
        return result.success;
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        return false;
    }
}

async function checkCommands() {
    const requiredCommands = ['cat', 'ls', 'echo'];
    for (const command of requiredCommands) {
        try {
            await Deno.run({
                cmd: [command, '--version'],
                stdout: 'null',
                stderr: 'null',
            }).status();
        } catch {
            console.error(`Command not found: ${command}`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAptLocks();
        const commandsAvailable = await checkCommands();
        if (locksCleared && commandsAvailable) {
            return Response.json({ success: true, message: 'Environment validated successfully.' });
        } else {
            return Response.json({ error: 'Environment validation failed, please check APT locks or command availability.' }, { status: 503 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});