import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const { stdout } = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'piped',
    }).output();
    return new TextDecoder().decode(stdout).includes('fuser') ? true : false;
}

async function checkCommands(commandList) {
    const checks = commandList.map(async (cmd) => {
        const { code } = await Deno.run({
            cmd: ['bash', '-c', cmd],
            stdout: 'null',
            stderr: 'null',
        }).status();
        return { command: cmd, available: code === 0 };
    });
    return await Promise.all(checks);
}

const essentialCommands = ['cat', 'ls', 'echo']; // Add more essential commands as needed

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLocked = await checkAptLocks();
        if (aptLocked) {
            throw new Error('APT locks are active, please resolve them before executing tasks.');
        }
        const commandStatuses = await checkCommands(essentialCommands);
        const missingCommands = commandStatuses.filter(c => !c.available);
        if (missingCommands.length > 0) {
            throw new Error('Missing commands detected: ' + missingCommands.map(c => c.command).join(', '));
        }
        return Response.json({ message: 'All checks passed. Ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});