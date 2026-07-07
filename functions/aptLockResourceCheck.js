import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { runCommand } from './utils.ts';

async function checkAptLockAndResource() {
    // Check for APT locks
    const lockCheck = await runCommand('sudo fuser /var/lib/dpkg/lock');
    if(lockCheck) {
        console.log('APT lock detected, exiting...');
        return false;
    }
    // Check system resources
    const resources = await runCommand('free -m');
    console.log('Resources:
', resources);
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const resourceAvailable = await checkAptLockAndResource();
        if (!resourceAvailable) {
            return Response.json({ error: 'Cannot proceed due to APT locks or resource constraints.' }, { status: 503 });
        }
        // Proceed with executing critical tasks/commands
        // ...Task execution logic here...
        return Response.json({ status: 'Success' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});