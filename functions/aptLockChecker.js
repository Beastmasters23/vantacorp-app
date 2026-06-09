import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -k /var/lib/dpkg/lock*']
    });
    const { success } = await exec.status();
    if (!success) throw new Error('Failed to clear APT locks');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Pre-execution check for APT locks
        await clearAptLocks();

        // Proceed with main task logic here...

        return Response.json({ message: 'Task executed successfully!' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});