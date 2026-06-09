import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo apt-get clean');  // Clear apt caches
        await exec('sudo rm /var/lib/apt/lists/lock'); // Clear apt locks
    } catch (error) {
        console.error('Failed to clear apt locks:', error);
    }
}

async function validateCommandAvailability(commands) {
    const { exec } = Deno;
    for (const command of commands) {
        try {
            await exec(`command -v ${command}`);
        } catch {
            console.error(`Command ${command} is not available.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'grep', 'echo'];

    await checkAndClearLocks();
    await validateCommandAvailability(essentialCommands);

    return Response.json({ message: 'Pre-execution checks completed.' });
});