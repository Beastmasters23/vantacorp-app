import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocksAndVerifyCommands() {
    const { exec } = Deno;
    const aptLockCheck = await exec("lsof | grep /var/lib/dpkg/lock");
    if (aptLockCheck.success) {
        await exec("sudo rm /var/lib/dpkg/lock");
        await exec("sudo rm /var/lib/apt/lists/lock");
        await exec("sudo rm /var/cache/apt/archives/lock");
    }
    const commands = ['cat', 'ls', 'mkdir'];
    for (const cmd of commands) {
        const cmdCheck = await exec(`which ${cmd}`);
        if (!cmdCheck.success) {
            throw new Error(`Required command '${cmd}' not found.`);
        }
    }
},

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocksAndVerifyCommands();
        return Response.json({ status: 'Healthy' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
