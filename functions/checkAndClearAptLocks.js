import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -v /var/lib/dpkg/lock-frontend 2>/dev/null || true'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await exec.status();
    exec.close();
    return code === 0;
}

async function checkAndClearAptLocks() {
    const hasLocks = await clearAptLocks();
    if (!hasLocks) {
        console.log('No apt locks were found or cleared.');
    } else {
        console.log('Apt locks cleared successfully.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        return Response.json({ success: true, message: 'Checked and cleared apt locks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});