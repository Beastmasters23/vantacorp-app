import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from 'https://deno.land/x/exec/mod.ts';

async function clearAptLock() {
    try {
        await exec('sudo rm /var/lib/apt/lists/lock');
        await exec('sudo rm /var/cache/apt/archives/lock');
        await exec('sudo rm /var/lib/dpkg/lock*');
        await exec('sudo dpkg --configure -a');
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
    }
}

async function checkSystemAvailability() {
    // Check system load, disk space, etc.
    // Example: If CPU load is too high, return false.
    const { success } = await exec('uptime');
    if (!success) return false;
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLock();
        const resourcesAvailable = await checkSystemAvailability();
        if (!resourcesAvailable) {
            return Response.json({ error: 'System resources are not available for task execution.' }, { status: 503 });
        }
        // Proceed with task execution...
        return Response.json({ message: 'System is ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});