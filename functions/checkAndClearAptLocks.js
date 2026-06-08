import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const { exec } = Deno;
    try {
        const { stdout } = await exec('sudo fuser -v /var/lib/dpkg/lock-frontend');
        if (stdout.length > 0) {
            console.log('Apt lock detected. Attempting to clear...');
            await exec('sudo rm /var/lib/dpkg/lock-frontend');
            console.log('Apt lock cleared successfully.');
        } else {
            console.log('No apt locks detected. System is ready for tasks.');
        }
    } catch (error) {
        console.error('Failed to check or clear apt locks:', error);
        throw new Error('Apt lock check/clear failed');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        return Response.json({ message: 'Apt lock check completed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});