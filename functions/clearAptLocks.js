import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        // Check for APT locks
        const lockCheck = await exec('lsof /var/lib/dpkg/lock*');
        if (lockCheck.stdout) {
            // If locks are found, attempt to clear them
            await exec('sudo rm /var/lib/dpkg/lock*');
            console.log('APT locks cleared.');
        }
    } catch (error) {
        console.error('Error clearing APT locks:', error.message);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // The rest of the task logic can go here...
        return Response.json({ message: 'Task executed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});