import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocksAndCommands() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock && echo "APT lock is present; waiting..." || echo "No APT lock"'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await exec.status();
    exec.close();
    return code === 0 ? 'APT lock is present' : 'No APT lock';
}

async function checkCommandAvailability(commands) {
    const unavailable = [];
    for (const cmd of commands) {
        const process = Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped',
            stderr: 'piped',
        });
        const output = await process.output();
        const status = await process.status();
        process.close();
        if (status.code !== 0) {
            unavailable.push(cmd);
        }
    }
    return unavailable.length ? unavailable : null;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLockStatus = await checkAptLocksAndCommands();
        const commandsToCheck = ['cat', 'bash', 'sudo']; // Add other critical commands as needed
        const missingCommands = await checkCommandAvailability(commandsToCheck);

        if (aptLockStatus === 'APT lock is present' || missingCommands) {
            return Response.json({ aptLockStatus, missingCommands }, { status: 503 });
        }

        // Continue with the task as normal (implementation not shown here)
        return Response.json({ message: 'All checks passed, task can proceed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});