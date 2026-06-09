import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandAndLockChecker() {
    // Check if required commands are available
    const requiredCommands = ['cat', 'echo', 'ls'];
    for (const command of requiredCommands) {
        const commandExists = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        if (commandExists.length === 0) {
            throw new Error(`Command ${command} is not available.`);
        }
    }
    // Clear APT locks if they exist
    const lockCheck = await Deno.run({
        cmd: ['lsof', '/var/lib/dpkg/lock-frontend'],
        stdout: 'piped',
        stderr: 'piped',
    }).output();
    if (lockCheck.length > 0) {
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock-frontend'] }).status();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await commandAndLockChecker();
        return Response.json({ message: 'Pre-execution checks passed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});