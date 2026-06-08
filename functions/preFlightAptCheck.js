import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo fuser -k /var/lib/dpkg/lock* || echo 'No locks found'");
        await exec("sudo dpkg --configure -a");
    } catch (error) {
        console.error('Failed to clear apt locks:', error.message);
    }
}

async function preFlightAptCheck() {
    console.log('Checking for apt locks...');
    await clearAptLocks();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await preFlightAptCheck();
        return Response.json({ success: 'Apt lock check completed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});