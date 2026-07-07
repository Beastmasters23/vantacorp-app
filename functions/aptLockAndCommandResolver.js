import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const MAX_RETRIES = 3;
    const APT_LOCK_CHECK_CMD = 'sudo fuser -v /var/lib/dpkg/lock';

    async function resolveAptLocks() {
        let retries = 0;
        while (retries < MAX_RETRIES) {
            const { success } = await base44.execute(APT_LOCK_CHECK_CMD);
            if (success) {
                console.log('APT lock detected, resolving...');
                await base44.execute('sudo rm /var/lib/dpkg/lock');
                await base44.execute('sudo dpkg --configure -a');
                return;
            }
            retries++;
            console.log(`Retrying ${retries}/${MAX_RETRIES}...`);
            await new Promise(res => setTimeout(res, 1000));
        }
        throw new Error('Could not resolve APT locks after max retries.');
    }

    try {
        await resolveAptLocks();
        // Proceed with the intended task after resolving locks.
        const TASK_COMMAND = ''; // Specify the task command to run here.
        const result = await base44.execute(TASK_COMMAND);
        return Response.json(result, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});