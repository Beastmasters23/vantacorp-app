import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function monitorSystemLocks() {
    const locks = await Deno.run({
        cmd: ['bash', '-c', 'lsof | grep /var/lib/dpkg/lock']
    });
    return locks.status().then(status => !status.success);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const hasLocks = await monitorSystemLocks();

        if (hasLocks) {
            console.log('Found APT locks, logging and preparing to notify admins.');
            // Log current locks and notify admins
            // You can implement your logging and notification mechanisms here
        } else {
            console.log('No APT locks detected, system is ready for task execution.');
        }

        return Response.json({ status: 'System check completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});