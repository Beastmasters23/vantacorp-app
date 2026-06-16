import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocksAndCommands() {
    const { exec } = Deno;
    const aptLockCheck = await exec("fuser /var/lib/dpkg/lock");
    const commandAvailability = ['cat', 'echo'].map(cmd => exec(`which ${cmd}`)); // Add more essential commands as needed

    const lockDetected = aptLockCheck.stdout.length > 0;
    const commandsAvailable = await Promise.all(commandAvailability);
    const missingCommands = commandsAvailable.filter(result => result.status !== 0);

    if (lockDetected || missingCommands.length > 0) {
        return { error: 'APT lock detected or missing commands', lockDetected, missingCommands };
    }
    return { success: true };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const preTaskCheck = await checkAptLocksAndCommands();
        if (preTaskCheck.error) {
            return Response.json({ error: preTaskCheck.error, lockDetected: preTaskCheck.lockDetected, missingCommands: preTaskCheck.missingCommands }, { status: 400 });
        }
        // Proceed with task execution
        // ... (task execution logic goes here) 
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});