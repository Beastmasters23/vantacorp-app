import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Function to check and clear APT locks
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock && sudo rm -f /var/lib/dpkg/lock']
    });
    await exec.status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});