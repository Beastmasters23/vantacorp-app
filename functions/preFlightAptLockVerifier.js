import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    // Check for existing apt locks
    try {
        const { success } = await exec('sudo fuser /var/lib/dpkg/lock-frontend');
        if (success) {
            console.log('Apt lock is present, clearing it.');
            await exec('sudo rm /var/lib/dpkg/lock-frontend');
            await exec('sudo rm /var/cache/apt/archives/lock');
        }
    } catch (e) {
        console.warn('Error while clearing apt locks:', e);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Proceed with further task execution
        return Response.json({ status: 'Apt locks checked and cleared if present.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});