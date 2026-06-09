import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo apt-get clean");
        await exec("sudo rm /var/lib/apt/lists/lock");
        await exec("sudo rm /var/cache/apt/archives/lock");
        await exec("sudo rm /var/lib/dpkg/lock");
        await exec("sudo dpkg --configure -a");
    } catch (e) {
        console.error('Error clearing APT locks:', e);
    }
}

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        try {
            const { code } = await exec(command);
            if (code !== 0) {
                throw new Error(`${command} unavailable`);
            }
        } catch (e) {
            console.error('Command not found:', e);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'echo']; // Add necessary commands here
    await clearAptLocks();
    const commandsAvailable = await checkCommandAvailability(commandsToCheck);

    if (!commandsAvailable) {
        return Response.json({ error: 'Required commands are not available.' }, { status: 500 });
    }
    return Response.json({ status: 'Environment is ready for task execution.' });
});