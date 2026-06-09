import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function preFlightCheck() {
        // Check for APT locks
        const isLocked = await checkAptLocks();
        if (isLocked) {
            throw new Error('APT is locked, please resolve it before executing the task.');
        }

        // Check command availability
        const missingCommands = await checkMissingCommands();
        if (missingCommands.length > 0) {
            throw new Error('Missing commands: ' + missingCommands.join(', '));
        }
    }

    async function checkAptLocks() {
        const { stdout } = await Deno.run({
            cmd: ['bash', '-c', 'if fuser /var/lib/dpkg/lock >/dev/null 2>&1; then echo locked; else echo unlocked; fi'],
            stdout: 'piped'
        }).output();
        return new TextDecoder().decode(stdout).trim() === 'locked';
    }

    async function checkMissingCommands() {
        const requiredCommands = ['cat', 'ls', 'echo']; // Add more as necessary
        const missing = [];
        for (const cmd of requiredCommands) {
            try {
                await Deno.run({ cmd: [cmd], stdout: 'null' }).status();
            } catch {
                missing.push(cmd);
            }
        }
        return missing;
    }

    try {
        await preFlightCheck();
        return Response.json({ message: 'All checks passed. Proceeding with task execution...' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});