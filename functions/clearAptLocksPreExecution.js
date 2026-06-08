import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLocks = async () => {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/run/apt.lock'];
    for (const lock of lockFiles) {
        try {
            await Deno.run({ cmd: ['sudo', 'rm', lock] });
        } catch (error) {
            // Log image or notify — cannot clear locks
        }
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ status: 'APT locks cleared if any were present.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});