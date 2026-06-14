import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLocks() {
    // Check for APT locks and clear them if found.
    const lockCheckCommand = 'sudo fuser -v /var/lib/dpkg/lock; sudo fuser -v /var/lib/dpkg/lock-frontend;'
    const { success, output } = await executeCommand(lockCheckCommand);
    if (success) {
        await executeCommand('sudo rm -f /var/lib/dpkg/lock');
        await executeCommand('sudo rm -f /var/lib/dpkg/lock-frontend');
    }
}

async function executeCommand(command) {
    const process = Deno.run({
        cmd: ['sh', '-c', command],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await process.output();
    const error = await process.stderrOutput();
    const success = process.status().success;
    return { success, output: new TextDecoder().decode(output), error: new TextDecoder().decode(error) };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearLocks();
        // Proceed with task execution logic here.
        return Response.json({ message: 'Pre-execution check completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});