import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const locks = await Deno.run({ cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/lib/apt/lists/lock; sudo fuser -k /var/cache/apt/archives/lock'] });
    const status = await locks.status();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLockCleared = await clearAptLocks();
        if (!aptLockCleared) {
            throw new Error('Failed to clear APT locks, tasks cannot proceed.');
        }
        return Response.json({ message: 'APT locks cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});