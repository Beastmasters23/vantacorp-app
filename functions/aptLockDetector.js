import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const response = await Deno.run({
            cmd: ['sh', '-c', 'sudo fuser -v /var/lib/dpkg/lock; sudo apt-get update'],
        });
        const { code } = await response.status();
        return code === 0 ? true : false;
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const aptCleared = await clearAptLocks();
    if (!aptCleared) {
        return Response.json({ error: 'Unable to clear APT locks, aborting task execution.' }, { status: 500 });
    }
    // Proceed with task execution logic here...
    return Response.json({ message: 'APT locks cleared, task ready to execute.' }, { status: 200 });
});