import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo fuser -k /var/lib/dpkg/lock-frontend'); // Stop processes using APT lock
        await exec('sudo rm /var/lib/dpkg/lock-frontend'); // Remove APT lock file
        await exec('sudo fuser -k /var/cache/apt/archives/lock'); // Stop processes using APT cache lock
        await exec('sudo rm /var/cache/apt/archives/lock'); // Remove APT cache lock file
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        throw new Error('Unable to clear APT locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Call the APT lock clearer
        // Continue with normal task execution... 
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});