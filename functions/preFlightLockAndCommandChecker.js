import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo apt-get clean");
        await exec("sudo rm /var/lib/apt/lists/lock");
        await exec("sudo rm /var/cache/apt/archives/lock");
        await exec("sudo rm /var/lib/dpkg/lock* ");
    } catch (error) {
        console.error('Error clearing APT locks:', error);
    }
}

async function checkCommandAvailability(commands) {
    const { exec } = Deno;
    for (const command of commands) {
        try {
            await exec(`command -v ${command}`);
        } catch {
            console.warn(`Command not found: ${command}`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    await clearAptLocks();
    const commandsToCheck = ['cat', 'ls', 'mkdir'];
    const allCommandsAvailable = await checkCommandAvailability(commandsToCheck);
    if (!allCommandsAvailable) {
        return Response.json({ message: 'Essential commands are missing.' }, { status: 500 });
    }
    return Response.json({ message: 'Pre-flight checks completed successfully.' }, { status: 200 });
});