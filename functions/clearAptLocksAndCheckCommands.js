import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLocks = async () => {
    const locks = await Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/apt/lists/lock /var/lib/dpkg/lock /var/lib/apt/lists/lock-'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await locks.status();
    if (code !== 0) throw new Error('Failed to clear APT locks');
};

const checkCommandAvailability = async () => {
    const commands = ['cat', 'ls', 'echo']; // Add necessary commands here
    for (const command of commands) {
        const check = await Deno.run({
            cmd: ['bash', '-c', `command -v ${command}`],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await check.status();
        if (code !== 0) throw new Error(
            `Required command ${command} not found`
        );
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        await checkCommandAvailability();
        return Response.json({ success: true });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});