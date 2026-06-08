import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPLocks() {
    const locks = await Deno.run({
        cmd: ['sh', '-c', 'sudo lsof /var/lib/dpkg/lock']
    });

    const { success } = await locks.status();
    if (success) {
        console.log('APT lock detected. Clearing...');
        await Deno.run({
            cmd: ['sh', '-c', 'sudo rm /var/lib/dpkg/lock']
        });
        console.log('APT lock cleared.');
    } else {
        console.log('No APT lock detected. Proceeding.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAPLocks();
        // Proceed with other tasks...
        return Response.json({ message: 'Tasks ready to execute.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});