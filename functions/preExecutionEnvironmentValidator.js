import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAPTAndCommands() {
    const aptLockExists = await checkAPTLock();
    const commandsAvailable = await checkRequiredCommands(['cat', 'bash']);
    return { aptLockExists, commandsAvailable };
}

async function checkAPTLock() {
    // Check for APT lock presence
    const lockCheck = await Deno.run({
        cmd: ['sh', '-c', 'ls /var/lib/dpkg/lock*'],
        stdout: 'null',
        stderr: 'null',
    }).status();
    return lockCheck.success;
}

async function checkRequiredCommands(commands) {
    const results = await Promise.all(commands.map(async cmd => {
        const commandCheck = await Deno.run({
            cmd: ['sh', '-c', `command -v ${cmd}`],
            stdout: 'null',
            stderr: 'null',
        }).status();
        return commandCheck.success;
    }));
    return results.every(result => result);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { aptLockExists, commandsAvailable } = await checkAPTAndCommands();
        if (aptLockExists) {
            throw new Error('APT lock is active');
        }
        if (!commandsAvailable) {
            throw new Error('Required commands are missing');
        }
        // Continue with task execution...
        return Response.json({ result: 'All checks passed, continuing with task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});