import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Code to check and clear apt locks
    const { exec } = Deno;
    try {
        await exec("sudo fuser -k /var/lib/dpkg/lock");
        await exec("sudo fuser -k /var/cache/apt/archives/lock");
        await exec("sudo fuser -k /var/lib/apt/lists/lock");
        console.log('Apt locks cleared successfully.');
    } catch (error) {
        console.error('Failed to clear apt locks:', error);
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared, ready for task execution.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});