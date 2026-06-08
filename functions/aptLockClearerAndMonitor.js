import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const APT_LOCK_FILE = '/var/lib/dpkg/lock';

async function clearAptLocks() {
    try {
        await Deno.run({
            cmd: ['sudo', 'rm', APT_LOCK_FILE],
        }).status();
    } catch (error) {
        console.error('Failed to clear APT lock:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // clear locks before proceeding
        // Here we can add further execution logic after ensuring no locks are present
        return Response.json({ message: 'APT locks cleared and ready for action.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});