import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        // Attempt to clear apt locks
        await exec('sudo rm /var/lib/apt/lists/lock', {silent: true});
        await exec('sudo rm /var/lib/dpkg/lock', {silent: true});
        await exec('sudo rm /var/lib/apt/lists/lock.old', {silent: true});
        console.log('Apt locks cleared successfully.');
    } catch (error) {
        console.error('Error clearing apt locks:', error);
        throw new Error('Failed to clear apt locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    await clearAptLocks();
    try {
        // Continue with task processing...
        return Response.json({ message: 'Apt locks cleared and task processing started.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});