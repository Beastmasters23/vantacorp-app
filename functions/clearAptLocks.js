import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo fuser -k /var/lib/dpkg/lock');
        await exec('sudo fuser -k /var/cache/apt/archives/lock');
        await exec('sudo fuser -k /var/lib/apt/lists/lock');
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        throw new Error('Unable to clear APT locks, tasks may fail.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Proceed with executing the actual task logic here...
        return Response.json({ success: true, message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});