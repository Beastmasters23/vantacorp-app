import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const { success } = await Deno.run({
            cmd: ['sh', '-c', 'sudo fuser -k /var/lib/dpkg/lock*'],
            stdout: 'piped',
            stderr: 'piped',
        }).status();
        return success;
    } catch (error) {
        console.error('Error clearing APT locks:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockClearance = await clearAptLocks();
        if (!lockClearance) {
            return Response.json({ error: 'Unable to clear APT locks. Please check manually.' }, { status: 500 });
        }
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});