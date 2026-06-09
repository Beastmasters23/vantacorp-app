import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        const { success } = await Deno.run({
            cmd: ['command', '-v', cmd],
            stdout: 'null',
            stderr: 'null',
        });
        if (!success) missingCommands.push(cmd);
    }
    return missingCommands;
}

async function clearAptLocks() {
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'], stderr: 'inherit' }).status();
    await Deno.run({ cmd: ['sudo', 'apt-get', 'clean'], stderr: 'inherit' }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'grep', 'awk']; // Modify as needed
    try {
        const missingCommands = await checkCommandAvailability(requiredCommands);
        if (missingCommands.length > 0) {
            return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 400 });
        }
        await clearAptLocks();
        // Proceed with other tasks after checks are complete.
        return Response.json({ status: "All checks passed, ready to execute tasks." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});