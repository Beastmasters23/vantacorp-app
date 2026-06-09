import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        await checkCriticalCommands();
        return Response.json({ message: "Pre-execution checks passed, ready to execute tasks." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearAptLocks() {
    const aptLock = await Deno.run({ cmd: ['ls', '/var/lib/dpkg/lock'], stderr: 'piped' }).status();
    if (aptLock.code === 0) {
        // Logic to clear the apt lock if it exists
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'] }).status();
    }
}

async function checkCriticalCommands() {
    const commands = ['cat', 'echo', 'ls']; // Add more critical commands here
    for (const command of commands) {
        const status = await Deno.run({ cmd: ['which', command], stderr: 'piped' }).status();
        if (status.code !== 0) {
            throw new Error(`Command ${command} is missing, please install it.`);
        }
    }
}