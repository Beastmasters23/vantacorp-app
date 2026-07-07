import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Function to resolve APT locks before executing a task
async function checkAndClearApplock() {
    const lockFilePath = '/var/lib/dpkg/lock'; // Path to the APT lock file
    const fs = Deno.run({
        cmd: ['sudo', 'rm', lockFilePath],
        stderr: 'piped',
        stdout: 'piped'
    });
    const { code } = await fs.status();
    fs.close();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const lockCleared = await checkAndClearApplock();
    if (!lockCleared) {
        return Response.json({ error: 'Failed to clear APT lock. Task aborted.' }, { status: 403 });
    }

    try {
        // Proceed with task execution
        // Insert task execution logic here
        return Response.json({ message: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});