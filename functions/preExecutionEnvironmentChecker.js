import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function ensureCommandAvailability(commands) {
    // Function to check valid command availability
    for (const command of commands) {
        const check = Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null'
        });
        const status = await check.status();
        if (!status.success) {
            throw new Error(`Command not found: ${command}`);
        }
    }
}

async function clearAptLocks() {
    const checkLock = Deno.run({
        cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock'],
        stderr: 'piped'
    });
    const { code } = await checkLock.status();
    if (code !== 0) {
        throw new Error('Could not clear apt lock');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'ls', 'echo'];  // List of critical commands to check
    try {
        await clearAptLocks();
        await ensureCommandAvailability(commands);
        return Response.json({ message: 'Environment validated and ready.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});