import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const { exec } = Deno;
        const { stdout } = await exec('sudo fuser -k /var/lib/dpkg/lock-frontend');
        console.log(stdout);
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});