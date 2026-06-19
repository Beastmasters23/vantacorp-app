import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocksAndValidateCommands() {
    const lockCheckCommand = 'sudo rm -rf /var/lib/apt/lists/lock';
    const commandCheck = ['cat', 'echo', 'ls']; // essential commands to check

    // Clear APT locks
    try {
        await Deno.run({ cmd: ['sh', '-c', lockCheckCommand] }).status();
    } catch (error) {
        console.error('Error clearing APT locks:', error);
        throw new Error('Failed to clear APT locks.');
    }

    // Check for essential commands
    for (const cmd of commandCheck) {
        const cmdCheck = await Deno.run({ cmd: ['which', cmd] }).status();
        if (cmdCheck.code !== 0) {
            console.error(`Missing essential command: ${cmd}`);
            throw new Error(`Command not found: ${cmd}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearLocksAndValidateCommands();
        return Response.json({ message: 'Locks cleared and commands validated successfully.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});