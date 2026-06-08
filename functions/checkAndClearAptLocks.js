import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const result = await Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -v /var/lib/dpkg/lock-frontend || echo 0'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { stdout, stderr } = await result.output();
    const lockStatus = new TextDecoder().decode(stdout).trim();
    if (lockStatus !== '0') {
        // Attempt to clear APT locks
        await Deno.run({
            cmd: ['sudo', 'apt', 'remove', '-y', '--force-confold']
        }).status();
    }
    return;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        return Response.json({ message: 'APT lock check and clearing completed.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});