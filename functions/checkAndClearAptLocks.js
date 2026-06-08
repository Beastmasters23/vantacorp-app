import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Function to check and clear apt locks
        const checkAndClearAptLocks = async () => {
            const locks = await Deno.run({
                cmd: ['sh', '-c', 'sudo fuser -v /var/lib/dpkg/lock; sudo fuser -v /var/lib/dpkg/lock-frontend'],
                stderr: 'piped',
                stdout: 'piped'
            });
            const { stdout, stderr } = await locks.output();
            const { code } = await locks.status();
            if (code !== 0) {
                const errorMessage = new TextDecoder().decode(stderr);
                throw new Error(`Apt lock issue detected: ${errorMessage}`);
            }
            // If no locks are found, clear them
            await Deno.run({
                cmd: ['sh', '-c', 'sudo rm -f /var/lib/dpkg/lock; sudo rm -f /var/lib/dpkg/lock-frontend'],
            }).status();
            console.log('Apt locks cleared successfully');
        };

        // Attempting to run the function
        await checkAndClearAptLocks();
        return Response.json({ status: 'success', message: 'Apt locks checked and cleared if necessary.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});