import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const checkAndClearLocks = async () => {
        try {
            // Check for APT locks
            const locks = await Deno.run({
                cmd: ['lsof', '/var/lib/dpkg/lock'],
                stdout: 'piped',
                stderr: 'piped'
            });
            const output = await locks.output();
            if (output.length > 0) {
                // Clear the APT lock if found
                console.log('Clearing APT locks...');
                await Deno.run({
                    cmd: ['sudo', 'rm', '/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'],
                }).status();
            }
            return true;
        } catch (err) {
            console.error('Error checking or clearing APT locks:', err);
            return false;
        }
    };

    const checkCommandAvailability = async (command) => {
        try {
            const cmd = await Deno.run({
                cmd: ['which', command],
                stdout: 'piped',
                stderr: 'piped'
            });
            const output = await cmd.output();
            return output.length > 0;
        } catch (err) {
            console.error('Error checking command availability for:', command, err);
            return false;
        }
    };

    const commandsToCheck = ['cat', 'echo']; // Extend this list as needed
    const locksCleared = await checkAndClearLocks();
    const allCommandsAvailable = await Promise.all(commandsToCheck.map(checkCommandAvailability));

    if (!locksCleared || allCommandsAvailable.includes(false)) {
        throw new Error('Pre-execution checks failed: APT locks or commands unavailable.');
    }

    // Task execution logic here
    return Response.json({ message: 'Tasks can be executed safely.' });
});