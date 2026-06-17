import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Logic to check and clear any APT locks
    try {
        const { exec } = Deno;
        await exec("sudo fuser -k /var/lib/apt/lists/lock"); // Kill processes holding the APT lock
        await exec("sudo fuser -k /var/cache/apt/archives/lock");
        await exec("sudo fuser -k /var/lib/dpkg/lock");
    } catch (error) {
        console.error('Error clearing APT locks', error);
        throw new Error('Failed to clear APT locks');
    }
}

async function checkEssentialCommands() {
    // Logic to validate essential commands
    const essentialCommands = ['apt', 'cat', 'bash']; // Example list of essential commands
    for (const cmd of essentialCommands) {
        const { code } = await exec(`which ${cmd}`);
        if (code !== 0) {
            console.log(
                `${cmd} is missing. Attempting to install it...`
            );
            await exec(`sudo apt-get install -y ${cmd}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        await checkEssentialCommands();
        return Response.json({ message: 'Environment validated and prepared for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});