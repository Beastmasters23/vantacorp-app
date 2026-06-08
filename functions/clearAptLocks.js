import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        const { code } = await exec("sudo fuser -k /var/lib/dpkg/lock");
        if (code !== 0) throw new Error('Failed to clear apt locks');
    } catch (error) {
        console.error('Error clearing apt locks', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Execute additional task logic here
        return Response.json({ status: 'success', message: 'Apt locks cleared if they existed.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});