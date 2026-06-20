import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const lockExist = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/apt/lists/lock']
    }).status();
    if (lockExist.success) {
        console.log('APT lock is active, clearing...');
        await Deno.run({ cmd: ['sudo', 'apt-get', 'clean'] }).status();
        console.log('APT locks cleared.');
    } else {
        console.log('No APT locks detected.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ success: 'APT lock management executed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});