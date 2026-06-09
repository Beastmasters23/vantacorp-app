import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CHECK_TIMEOUT = 300;

async function validateEnvironment() {
    // Check for APT locks
    const aptLock = await Deno.run({
        cmd: ['sh', '-c', 'sudo lsof /var/lib/dpkg/lock']
    });
    const { code: lockCode } = await aptLock.status();
    aptLock.close();

    if (lockCode === 0) {
        throw new Error('APT lock is present. Please resolve it before executing tasks.');
    }

    // Check for required commands
    const commandsToCheck = ['cat', 'grep', 'echo']; // Add other essential commands here
    for (const command of commandsToCheck) {
        const cmdCheck = await Deno.run({
            cmd: ['which', command]
        });
        const { code: cmdCode } = await cmdCheck.status();
        cmdCheck.close();
        if (cmdCode !== 0) {
            throw new Error(`Command missing: ${command}. Ensure it is installed.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await validateEnvironment();
        return Response.json({ message: 'Environment validated successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});