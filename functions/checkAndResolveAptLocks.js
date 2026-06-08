import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const { exec } = Deno;
    const cmd = "sudo fuser /var/lib/dpkg/lock*";
    const { code } = await exec(cmd);
    return code === 0;
}

async function unlockAptLocks() {
    const { exec } = Deno;
    await exec('sudo rm /var/lib/dpkg/lock*');
    await exec('sudo dpkg --configure -a');
}

async function logAptLocks() {
    const hasLocks = await checkAptLocks();
    if (hasLocks) {
        console.error('Apt locks detected. Resolving...');
        await unlockAptLocks();
        console.log('Apt locks resolved.');
    } else {
        console.log('No apt locks detected.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await logAptLocks();
        // Proceed with task execution logic here...
        return Response.json({ success: 'Locks checked and handled.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});