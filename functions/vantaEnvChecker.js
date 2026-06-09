import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function checkEnvironment() {
        // Function to check for APT locks
        const aptLocked = await checkAptLocks();
        if (aptLocked) {
            throw new Error('APT locks detected. Please resolve before execution.');
        }

        // Check for essential commands
        const commands = ['cat', 'echo']; // Add more critical commands here
        for (const cmd of commands) {
            const isAvailable = await checkCommandAvailability(cmd);
            if (!isAvailable) {
                throw new Error(`Command ${cmd} is not available in the environment.`);
            }
        }
    }

    async function checkAptLocks() {
        // Check if APT is currently locked
        const result = await Deno.run({
            cmd: ['bash', '-c', 'test -f /var/lib/dpkg/lock; echo $?'],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await result.status();
        return code === 0;
    }

    async function checkCommandAvailability(command) {
        const result = await Deno.run({
            cmd: ['bash', '-c', `command -v ${command}`],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await result.status();
        return code === 0;
    }

    try {
        await checkEnvironment();
        return Response.json({ status: 'Environment check passed, ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});