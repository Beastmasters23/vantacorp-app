import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo rm /var/lib/dpkg/lock');
        await exec('sudo rm /var/cache/apt/archives/lock');
        await exec('sudo rm /var/lib/dpkg/lock-frontend');
        return { cleared: true, message: 'APT locks cleared.' };
    } catch (error) {
        return { cleared: false, message: error.message };
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await clearAptLocks();
        return Response.json(result);
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});