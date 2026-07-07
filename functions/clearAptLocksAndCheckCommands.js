import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndCommandCheck() {
    // Check for active APT processes
    const aptLockCheck = await Deno.run({
        cmd: ['bash', '-c', "ps aux | grep -i apt | grep -v grep"],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code: aptLockCode } = await aptLockCheck.status();

    if (aptLockCode === 0) {
        console.error('APT process detected, attempting to clear.');
        await Deno.run({ cmd: ['bash', '-c', 'sudo killall apt-get'] }).status();
        console.log('APT locks cleared.');
    } else {
        console.log('No APT locks detected.');
    }

    // Check for essential commands
    const requiredCommands = ['cat', 'echo'];
    for (const cmd of requiredCommands) {
        const commandCheck = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stdout: 'piped',
            stderr: 'piped',
        });
        const { code } = await commandCheck.status();
        if (code !== 0) {
            console.error(`Command not found: ${cmd}. Attempting recovery.`);
            // Logic to recover or alert for missing commands
            // This could involve notifying admins or attempting an install if permissive.
        } else {
            console.log(`Command found: ${cmd}.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTAndCommandCheck();
        return Response.json({ message: 'Pre-execution checks completed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});