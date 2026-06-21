import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkRequiredCommands(commands) {
    const missingCommands = [];

    for (const cmd of commands) {
        const exists = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped'
        }).output();
        if (!exists.length) {
            missingCommands.push(cmd);
        }
    }

    return missingCommands;
}

async function checkAptLocks() {
    const result = await Deno.run({
        cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock*'],
    }).status();
    return result.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'grep', 'awk'];
    const aptLocksCleared = await checkAptLocks();
    const missingCommands = await checkRequiredCommands(requiredCommands);

    if (!aptLocksCleared) {
        return Response.json({ error: "APT locks are present and need to be cleared." }, { status: 400 });
    }
    if (missingCommands.length > 0) {
        return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 400 });
    }

    // Proceed with normal task execution...
    return Response.json({ message: 'All checks passed. Ready to execute tasks.' });
});