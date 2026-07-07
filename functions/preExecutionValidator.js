import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLocks() {
    // Function to check for APT locks and clear them if present
    try {
        const execResult = await Deno.run({  
            cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock || true'], // clear any APT locks
        }).status();
        return execResult.success;
    } catch (error) {
        console.error('Failed to clear locks:', error);
        return false;
    }
}

async function checkCommandExists(command) {
    // Check if a command exists in the system
    try {
        const execResult = await Deno.run({
            cmd: ['bash', '-c', `command -v ${command}`],
        }).status();
        return execResult.success;
    } catch (error) {
        console.error('Error checking command existence:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const requiredCommands = ['cat', 'bash']; // Add other required commands here
    const allChecksPassed = await Promise.all([
        checkAndClearLocks(),
        ...requiredCommands.map(cmd => checkCommandExists(cmd))
    ]);

    const allReady = allChecksPassed.every(check => check);

    if (!allReady) {
        return Response.json({ error: 'Pre-execution check failed. APT locks or required commands missing.' }, { status: 500 });
    }

    // Task execution logic would go here...
    return Response.json({ message: 'All checks passed. Ready to execute tasks.' }, { status: 200 });
});