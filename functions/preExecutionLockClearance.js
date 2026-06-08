import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for existing APT locks
        const hasLock = await checkForAptLock();
        if (hasLock) {
            // Clear the APT locks
            await clearAptLocks();
            return Response.json({ status: 'APT locks cleared' }, { status: 200 });
        }
        return Response.json({ status: 'No APT locks' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkForAptLock() {
    // Logic to check if APT lock exists
    const result = await runCommand('sudo fuser /var/lib/dpkg/lock.*');
    return result.stdout.length > 0;
}

async function clearAptLocks() {
    // Logic to clear APT locks
    await runCommand('sudo rm /var/lib/dpkg/lock-frontend');
    await runCommand('sudo rm /var/lib/dpkg/lock');
}

async function runCommand(command) {
    // Utility to run shell commands and return results
    const process = Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await process.output();
    const error = await process.stderrOutput();
    return {
        stdout: new TextDecoder().decode(output),
        stderr: new TextDecoder().decode(error),
    };
}