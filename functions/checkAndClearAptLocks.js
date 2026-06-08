import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const lockFilePath = '/var/lib/dpkg/lock';
    const exists = await Deno.stat(lockFilePath).catch(() => false);
    if (exists) {
        await Deno.run({ cmd: ['sudo', 'rm', lockFilePath'] }).status();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        // Assuming a task function is called here after clearing locks.
        return Response.json({ status: 'All systems go' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});