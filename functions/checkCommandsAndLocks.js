import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandsAndLocks() {
    const { exec } = Deno;
    // Check if required commands are available
    const commandsToCheck = ['cat', 'chmod', 'chown'];
    for (const cmd of commandsToCheck) {
        try {
            await exec(`command -v ${cmd}`);
        } catch (err) {
            throw new Error(`Command not found: ${cmd}`);
        }
    }
    // Check for APT locks
    try {
        await exec('flock -n /var/lib/dpkg/lock-frontend true');
    } catch (err) {
        throw new Error('APT lock detected. Please clear APT locks before executing tasks.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkCommandsAndLocks();
        return Response.json({ message: 'Environment is ready, no locks detected and commands are available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});