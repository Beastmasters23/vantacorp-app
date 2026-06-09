import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const exec = Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -v /var/lib/dpkg/lock*'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await exec.status();
    if (code !== 0) {
        throw new Error('Apt lock is held by another process');
    }
    await exec.output();
    await exec.stderrOutput();

    const unlockExec = Deno.run({
        cmd: ['sudo', 'rm', '/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'],
    });
    const unlockStatus = await unlockExec.status();
    if (unlockStatus.code !== 0) {
        throw new Error('Failed to clear apt locks');
    } 
}

async function validateCommandAvailability(commands) {
    for (const command of commands) {
        const commandExec = Deno.run({ cmd: ['which', command], stdout: 'piped' });
        const output = await commandExec.output();
        const status = await commandExec.status();
        if (status.code !== 0 || output.length === 0) {
            throw new Error(`Command not found: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        await validateCommandAvailability(['cat', 'ls', 'echo']); // Add any critical commands
        return Response.json({ message: 'System is ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
