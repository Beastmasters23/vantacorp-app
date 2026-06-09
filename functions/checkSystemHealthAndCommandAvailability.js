import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preExecutionCheck() {
    const aptLockCheck = await checkAptLocks();
    const commandsAvailable = await checkEssentialCommands();
    return { aptLockCheck, commandsAvailable };
}

async function checkAptLocks() {
    // Simulated check for apt locks
    const locks = await Deno.run({
        cmd: ['bash', '-c', 'if [ -f /var/lib/dpkg/lock ]; then echo 1; else echo 0; fi'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await locks.status();
    return code === 0 ? 'No locks detected' : 'APT lock detected, clearing...';
}

async function checkEssentialCommands() {
    const commands = ['cat', 'echo', 'ls'];
    const availableCommands = await Promise.all(commands.map(async (cmd) => {
        const proc = Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped',
            stderr: 'piped',
        });
        const { code } = await proc.status();
        return code === 0;
    }));
    return availableCommands.every(Boolean) ? 'All essential commands available' : 'Missing one or more commands';
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { aptLockCheck, commandsAvailable } = await preExecutionCheck();
        return Response.json({ aptLockCheck, commandsAvailable }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});