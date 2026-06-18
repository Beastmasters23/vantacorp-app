import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkEnvironment() {
    const { exec } = Deno;
    // Check for APT locks
    const aptLockStatus = await exec("lsof /var/lib/dpkg/lock").catch(() => false);
    if (aptLockStatus) {
        console.error('APT lock detected, unable to proceed with task execution.');
        return false;
    }
    // Check for essential commands
    const essentialCommands = ['cat', 'echo', 'ls'];
    for (const command of essentialCommands) {
        const commandStatus = await exec(`${command} --version`).catch(() => false);
        if (!commandStatus) {
            console.error(`Essential command ${command} is missing.`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const envCheck = await checkEnvironment();
    if (!envCheck) {
        return Response.json({ error: 'Environment check failed. Task execution halted.' }, { status: 500 });
    }
    // Proceed with task execution...
    return Response.json({ message: 'Environment is ready for task execution.' });
});