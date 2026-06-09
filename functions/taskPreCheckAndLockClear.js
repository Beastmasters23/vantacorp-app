import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock']
    });
    const { status } = await exec.status();
    return status.success;
}

async function checkTaskTimeout(start, threshold) {
    return (Date.now() - start) > threshold;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const threshold = 300 * 1000; // 5 minutes
        const startTime = Date.now();
        const taskIsLocked = await clearAptLocks();

        if (!taskIsLocked) {
            const isTimedOut = await checkTaskTimeout(startTime, threshold);
            if (isTimedOut) {
                return Response.json({ error: 'Task exceeded maximum allowed execution time.' }, { status: 500 });
            }
            return Response.json({ success: 'Task can proceed successfully.' });
        } else {
            return Response.json({ error: 'Could not clear task lock.' }, { status: 500 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});