import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo fuser -vki /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock');
        console.log('APT locks cleared.');
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        throw new Error('APT lock clearance failed');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});