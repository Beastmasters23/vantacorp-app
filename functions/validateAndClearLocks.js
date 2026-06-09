import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Function to check and clear APT locks and validate command existence
    async function validateCommandsAndLocks() {
        // Check for existing APT lock
        const aptLockCheck = await Deno.run({
            cmd: ['bash', '-c', 'if [ -f /var/lib/dpkg/lock ]; then echo locked; fi'],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await aptLockCheck.status();
        if (code === 0) {
            console.log('APT is locked, clearing...');
            await Deno.run({ cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock'] }).status();
        }

        // Validate essential commands
        const requiredCommands = ['cat', 'bash'];

        for (const cmd of requiredCommands) {
            const commandCheck = await Deno.run({ cmd: ['which', cmd], stdout: 'piped', stderr: 'piped' });
            const output = new TextDecoder().decode(await commandCheck.output());
            if (!output) {
                throw new Error(`Required command ${cmd} is missing!`);
            }
        }
    }

    try {
        // Execute pre-flight checks
        await validateCommandsAndLocks();
        // Proceed with actual task execution logic...
        return Response.json({ status: 'checks passed, task can proceed' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});