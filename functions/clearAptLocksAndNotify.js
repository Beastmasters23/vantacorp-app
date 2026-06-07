import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from 'https://deno.land/x/exec/mod.ts';

async function clearAptLocks() {
    try {
        await exec('sudo rm /var/lib/dpkg/lock-frontend');
        await exec('sudo rm /var/lib/dpkg/lock');
        await exec('sudo rm /var/cache/apt/archives/lock');
    } catch (error) {
        throw new Error('Failed to clear apt locks: ' + error.message);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});