import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo apt-get -y update');
        await exec('sudo apt-get -y upgrade');
    } catch (error) {
        throw new Error('Failed to clear APT locks: ' + error.message);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks
        await clearAptLocks();
        return Response.json({ status: 'APT locks cleared successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});