import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLocks() {
    // Logic to check for and clear any APT locks
    const { exec } = Deno;
    try {
        await exec('sudo rm /var/lib/apt/lists/lock');
        await exec('sudo rm /var/cache/apt/archives/lock');
        await exec('sudo rm /var/lib/dpkg/lock');
        await exec('sudo dpkg --configure -a');
        return true;
    } catch (error) {
        console.error('Failed to clear locks:', error);
        return false;
    }
}

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        const { status } = await exec(`command -v ${command}`);
        if (status !== 0) {
            console.error(
                `Command not found: ${command}. Please install it.`
            );
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'dpkg']; // Add other essential commands here

    try {
        const locksCleared = await checkAndClearLocks();
        const commandsAvailable = await checkCommandAvailability(essentialCommands);

        if (!locksCleared || !commandsAvailable) {
            return Response.json({ error: 'Pre-execution checks failed.' }, { status: 500 });
        }

        // Proceed with task execution
        return Response.json({ status: 'Pre-execution checks successful.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});