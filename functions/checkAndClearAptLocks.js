import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const output = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend; sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock']
    }).status();
    return output.success;
}

async function checkNextAptLock() {
    const locked = await Deno.run({
        cmd: ['bash', '-c', 'sudo lsof /var/lib/dpkg/lock-frontend']
    }).status();
    return locked.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (await checkNextAptLock()) {
            const cleared = await clearAptLocks();
            if (!cleared) throw new Error('Failed to clear APT locks!');
        }
        return Response.json({ message: 'APT locks checked and cleared if necessary.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});