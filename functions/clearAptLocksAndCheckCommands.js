import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTOrdersAndCheckCommands() {
    const commands = ['echo', 'cat', 'ls']; // Add more critical commands as necessary
    const aptLockCheckCommand = 'fuser /var/lib/dpkg/lock';
    const missingCommands = [];

    // Checking for APT locks
    const lockStatus = await Deno.run({
        cmd: ['bash', '-c', aptLockCheckCommand],
        stdout: 'null',
        stderr: 'null'
    }).status();

    if (lockStatus.success) {
        console.error('APT lock detected, attempting to clear...');
        await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean'],
            stdout: 'null',
            stderr: 'null'
        }).status();
    }

    // Check for critical commands availability
    for (const command of commands) {
        const commandStatus = await Deno.run({
            cmd: ['bash', '-c', command],
            stdout: 'null',
            stderr: 'null'
        }).status();
        if (!commandStatus.success) {
            missingCommands.push(command);
        }
    }

    if (missingCommands.length > 0) {
        console.error('Missing commands:', missingCommands);
        throw new Error('Critical commands missing: ' + missingCommands.join(', '));
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTOrdersAndCheckCommands();
        return Response.json({ message: 'Pre-flight checks passed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});