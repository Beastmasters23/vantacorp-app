import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Check if any apt processes are blocking
    const { stdout } = await Deno.run({
        cmd: ['sh', '-c', 'lsof /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/cache/apt/archives/lock']
    }).output();
    const output = new TextDecoder().decode(stdout);

    if (output) {
        console.log('Apt locks detected, attempting to clear...');
        // Attempt to clear locks
        await Deno.run({
            cmd: ['sh', '-c', 'sudo rm /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/cache/apt/archives/lock']
        }).status();
        console.log('Apt locks cleared.');
    } else {
        console.log('No apt locks detected.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'Apt lock status checked and cleared if necessary.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});