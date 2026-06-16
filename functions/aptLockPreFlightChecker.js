import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Utility function to check for and clear APT locks
async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock && sudo fuser -k /var/cache/apt/archives/lock']
    }).status();
    return result.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Attempt to clear APT locks
        const lockCleared = await clearAptLocks();
        if (!lockCleared) {
            return Response.json({ error: 'Failed to clear APT locks. Tasks may be blocked.' }, { status: 500 });
        }
        // Proceed with the intended task execution logic here.
        return Response.json({ success: 'APT locks cleared, ready for task execution.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});