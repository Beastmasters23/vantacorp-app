import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocksAndValidateCommands() {
    const { exec } = Deno;

    // Check for any APT locks
    const lockCheck = await exec("sudo fuser /var/lib/dpkg/lock");
    if (lockCheck.status === 0) {
        // If the lock exists, attempt to clear it
        await exec("sudo fuser -k /var/lib/dpkg/lock");
    }

    // Validate essential commands
    const requiredCommands = ['cat', 'ls', 'grep'];
    for (const command of requiredCommands) {
        const commandCheck = await exec(`which ${command}`);
        if (commandCheck.status !== 0) {
            throw new Error(
                `Essential command '${command}' is missing, aborting execution.`
            );
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocksAndValidateCommands();
        // Continue with task execution or invocation...
        return Response.json({ message: 'Tasks ready to execute after pre-check.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});