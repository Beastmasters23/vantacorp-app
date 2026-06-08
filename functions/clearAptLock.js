import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLock() {
    const output = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend; sudo fuser -k /var/lib/dpkg/lock;']
    }).status();
    return output.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockCleared = await clearAptLock();
        if (lockCleared) {
            return Response.json({ status: 'success', message: 'APT lock cleared successfully.' });
        } else {
            return Response.json({ error: 'Could not clear APT lock.' }, { status: 500 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});