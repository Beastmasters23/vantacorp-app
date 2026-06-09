import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock; sudo fuser -v /var/lib/apt/lists/lock; sudo fuser -v /var/cache/apt/archives/lock'],
    });
    const { code } = await exec.status();
    if (code === 0) {
        console.log('APT locks found. Attempting to clear');
        await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean']
        }).status();
    } else {
        console.log('No APT locks detected');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        return Response.json({ message: 'Task ready for execution after APT lock check.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});