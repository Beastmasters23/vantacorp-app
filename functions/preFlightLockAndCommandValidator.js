import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo apt-get remove -y lock"); // example command to clear locks
    } catch (error) {
        console.error('Error clearing APT lock:', error);
    }
}

async function checkCommandAvailability(command) {
    const { exec } = Deno;
    try {
        await exec(`command -v ${command}`);
        return true;
    } catch (error) {
        console.error('Command not found:', command);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    await clearAptLocks(); // Clear APT locks before task execution

    const commandsToCheck = ['cat', 'echo', 'ls']; // Expand this list as necessary
    const unavailableCommands = [];

    for (const command of commandsToCheck) {
        const available = await checkCommandAvailability(command);
        if (!available) {
            unavailableCommands.push(command);
        }
    }

    if (unavailableCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + unavailableCommands.join(', ') }, { status: 500 });
    }

    return Response.json({ message: 'All checks passed. Ready to execute tasks.' }, { status: 200 });
});