import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks(retryCount = 0) {
    // Command to check for apt locks
    const { output } = await runCommand('sudo fuser -v /var/lib/dpkg/lock');

    if (output.includes('locking')) {
        if (retryCount < 5) {
            // Exponential backoff
            await delay(Math.pow(2, retryCount) * 1000);
            return clearAptLocks(retryCount + 1);
        } else {
            throw new Error('Max retry attempts reached. Apt lock is still active.');
        }
    }
}

async function runCommand(command) {
    const process = Deno.run({
        cmd: ["sh", "-c", command],
        stdout: "piped",
        stderr: "piped"
    });
    const { stdout, stderr } = await process.output();
    return { output: new TextDecoder().decode(stdout), error: new TextDecoder().decode(stderr) };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Further task execution logic...
        return Response.json({ status: 'success' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});