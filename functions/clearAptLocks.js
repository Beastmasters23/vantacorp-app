import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo fuser -v /var/lib/dpkg/lock"); // Check if a lock is held
        await exec("sudo fuser -k /var/lib/dpkg/lock"); // Clear the lock if it exists
        console.log('APT locks cleared successfully');
    } catch (error) {
        console.error('Failed to clear APT locks:', error.message);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Execute the APT lock clearer function
        return Response.json({ message: 'APT lock check executed' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});