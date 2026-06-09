import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    // Check for and clear apt locks
    const { status } = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock || echo No locks found']
    }).status();
    return status === 0;
}

async function checkCommandAvailability(command) {
    // Check if the command is available in the current environment
    const { code } = await Deno.run({
        cmd: ['bash', '-c', `command -v ${command}`],
    }).status();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['CAT', 'grep', 'awk']; // Example commands to validate
    try {
        // Clear apt locks before executing further tasks
        await checkAndClearAptLocks();
        
        // Check for each command's availability
        for (const cmd of commandsToCheck) {
            const isAvailable = await checkCommandAvailability(cmd);
            if (!isAvailable) {
                throw new Error(`Command not found: ${cmd}`);
            }
        }
        return Response.json({ success: true, message: 'All checks passed!' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});