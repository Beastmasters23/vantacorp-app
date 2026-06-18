import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemHealth() {
    // Check for APT locks
    const aptLockCheck = await Deno.run({
        cmd: ['bash', '-c', "if lsof /var/lib/dpkg/lock; then echo 'locked'; fi"],
        stdout: 'piped',
        stderr: 'piped'
    }).output();
    const isAptLocked = new TextDecoder().decode(aptLockCheck).includes('locked');

    // Check for essential command availability
    const requiredCommands = ['cat', 'echo', 'ls'];
    const unavailableCommands = [];
    for (const cmd of requiredCommands) {
        const cmdCheck = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        if (!cmdCheck.length) unavailableCommands.push(cmd);
    }

    return { isAptLocked, unavailableCommands };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const healthStatus = await checkSystemHealth();
        if (healthStatus.isAptLocked) {
            throw new Error('APT is locked. Please resolve the lock before executing tasks.');
        }
        if (healthStatus.unavailableCommands.length > 0) {
            throw new Error('The following commands are unavailable: ' + healthStatus.unavailableCommands.join(', '));
        }
        // Proceed with task execution...
        return Response.json({ status: 'System is healthy, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});