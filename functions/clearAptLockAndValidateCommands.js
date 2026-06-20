import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLockAndValidateCommands() {
    // Check for APT locks
    const aptLockCheck = Deno.run({
        cmd: ['bash', '-c', 'lsof /var/lib/dpkg/lock'],
        stdout: 'null',
        stderr: 'null'
    });

    const status = await aptLockCheck.status();
    if (status.success) {
        console.error('APT lock is present, clearing...');
        // Attempt to remove the lock
        await Deno.run({ cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock'] }).status();
    }

    // Checking for critical commands
    const commands = ['git', 'cat', 'apt-get'];
    for (const cmd of commands) {
        const cmdCheck = Deno.run({ cmd: ['bash', '-c', `which ${cmd}`], stdout: 'null', stderr: 'null' });
        const cmdStatus = await cmdCheck.status();
        if (!cmdStatus.success) {
            console.error(`Missing command: ${cmd}. Ensure it's installed.`);
            // Suggest recovery or auto-install (if necessary)
            // Could implement function for auto-install if permissions allow
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLockAndValidateCommands();
        return Response.json({ message: 'APT check and command validation complete.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});