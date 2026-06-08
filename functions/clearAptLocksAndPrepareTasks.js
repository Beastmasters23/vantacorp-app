import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check and clear any apt locks before proceeding.
        await clearAptLocks();
        // Proceed with executing the task or directive.
        return Response.json({ message: 'Prepared for task execution' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function clearAptLocks() {
    // Attempt to clear any existing apt locks.
    try {
        const lockFilePath = '/var/lib/dpkg/lock';
        const lockExists = await Deno.stat(lockFilePath).catch(() => false);
        if (lockExists) {
            console.log('Apt lock detected, attempting to remove...');
            await Deno.remove(lockFilePath);
        }
        console.log('Apt locks checked.');
    } catch (error) {
        console.error('Error clearing apt locks:', error.message);
        throw new Error('Failed to clear apt locks');
    }
}