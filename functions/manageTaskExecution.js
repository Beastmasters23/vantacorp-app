import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const timeoutLimit = 300; // in seconds
    try {
        // Check and clear APT locks
        await clearAptLocks();
        // Start a timer for task execution
        const timeoutTimer = setTimeout(() => {
            console.error('Task execution timed out');
            // Logic to handle timeout (clean up, notify admins, etc.)
        }, timeoutLimit * 1000);

        // ... Your task execution code goes here ...

        // On successful completion, clear the timeout
        clearTimeout(timeoutTimer);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function clearAptLocks() {
    // Logic to check for APT locks and clear them as needed
    console.log('Checking for APT locks...');
    // Assume we have a command to simulate this behavior
    const commandResult = await runCommand('sudo rm /var/lib/apt/lists/lock', { silent: true });
    if (commandResult.exitCode !== 0) {
        console.warn('Failed to clear APT locks');
    } else {
        console.info('APT locks cleared successfully');
    }
}

async function runCommand(command, options = {}) {
    const process = Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped',
        ...options
    });
    const { code } = await process.status();
    const rawOutput = await process.output();
    process.close();
    return { exitCode: code, output: new TextDecoder().decode(rawOutput) };
}