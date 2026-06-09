import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -cuk /var/lib/dpkg/lock-frontend && sudo fuser -cuk /var/lib/dpkg/lock']
    }).status();
}

async function checkCommandAvailability(commands) {
    for (const cmd of commands) {
        const process = Deno.run({
            cmd: ['command', '-v', cmd],
            stdout: 'null',
            stderr: 'null'
        });
        const status = await process.status();
        process.close();
        if (!status.success) {
            throw new Error(`Required command ${cmd} is not available.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'bash', 'echo', 'curl'];
    try {
        // Clear any existing APT locks
        await clearAptLocks();
        // Check for essential commands before executing any task
        await checkCommandAvailability(requiredCommands);
        return Response.json({ message: 'Pre-execution checks passed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});