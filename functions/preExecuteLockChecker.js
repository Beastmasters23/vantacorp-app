import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTLocks() {
    // Logic to check and clear APT locks
    // Example: Executing a command to check locks and clearing them if found
    const { exec } = Deno;
    try {
        const result = await exec('sudo fuser -k /var/lib/dpkg/lock-frontend');
        console.log('APT locks cleared:', result);
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTLocks();
        return Response.json({ message: 'APT lock check and clearance executed' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});