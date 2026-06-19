import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocksAndCheck(commands) {
    // Check and clear APT locks
    const lockCheck = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock 2>/dev/null'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await lockCheck.status();
    if (code === 0) {
        throw new Error('APT locks are in use, please resolve them before executing commands.');
    }

    // Check command availability
    for (const cmd of commands) {
        const commandCheck = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stdout: 'piped',
            stderr: 'piped',
        });
        const { code } = await commandCheck.status();
        if (code !== 0) {
            throw new Error(`Command not found: ${cmd}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'grep', 'echo'];  // Example commands
    try {
        await clearLocksAndCheck(requiredCommands);
        // Proceed with task execution...
        return Response.json({success: true}, {status: 200});
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});