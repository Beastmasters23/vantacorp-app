import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLock() {
    const aptLockCheck = await Deno.run({
        cmd: ['bash', '-c', 'sudo lsof /var/lib/dpkg/lock']
    });
    const status = await aptLockCheck.status();
    if (status.success) {
        await Deno.run({
            cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock']
        }).status();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLock();
        // Further task execution logic can be placed here.
        return Response.json({ status: 'Apt lock checked and cleared if necessary.' }, { status: 200 });
    } catch(error) { 
        return Response.json({ error: error.message }, { status: 500 });
    }
});