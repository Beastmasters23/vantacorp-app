import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    // Function to check for APT locks
    const lockExists = await Deno.run({ cmd: ['test', '-e', '/var/lib/dpkg/lock'] }).status;
    if (lockExists.success) {
        // Clear the lock if it exists
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'] }).status;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();  // Check and clear APT locks before executing task
        // Additional task logic goes here
        return Response.json({ message: 'Task executed successfully'}, { status: 200 });
    } catch (error) {
        console.error('Task failed:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});