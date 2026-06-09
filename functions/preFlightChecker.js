import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Function to check for APT locks
        async function checkAndClearAptLocks() {
            const lockFile = '/var/lib/dpkg/lock';
            const exists = await Deno.stat(lockFile).catch(() => null);
            if (exists) {
                await Deno.remove(lockFile);
                console.log('APT lock cleared.');
            }
        }
        
        // Function to check if a critical command is available
        async function checkCommand(cmd) {
            const process = Deno.run({
                cmd: ['which', cmd],
                stdout: 'null',
                stderr: 'null',
            });
            const status = await process.status();
            process.close();
            return status.success;
        }

        // Pre-execution checker
        const commandsToCheck = ['cat', 'echo']; // Add any other critical commands needed
        await checkAndClearAptLocks();
        for (const command of commandsToCheck) {
            const isAvailable = await checkCommand(command);
            if (!isAvailable) throw new Error(`Command not found: ${command}`);
        }
        
        // Your task execution code can go here after checking
        return Response.json({ message: 'All checks passed, proceeding with task.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});