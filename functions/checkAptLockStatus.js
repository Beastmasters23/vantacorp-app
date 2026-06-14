import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    // This function checks for APT locks and returns the status
    const cmd = Deno.run({
        cmd: ['bash', '-c', 'sudo lsof /var/lib/dpkg/lock']
    });
    const { code } = await cmd.status();
    cmd.close();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isLocked = await checkAptLocks();
        return Response.json({ apt_lock_status: isLocked ? 'Locked' : 'Unlocked' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});