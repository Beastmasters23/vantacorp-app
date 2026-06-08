import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/apt/lists/lock /var/lib/dpkg/lock /var/cache/apt/archives/lock &> /dev/null || echo "No locks to clear."'],
    });
    const status = await result.status();
    return status.success ? 'Cleared APT locks successfully.' : 'No locks cleared.';
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check and clear APT locks
        const lockResult = await clearAptLocks();
        console.log(lockResult);

        // Additional task execution logic would go here

        return Response.json({ success: true, message: lockResult }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});