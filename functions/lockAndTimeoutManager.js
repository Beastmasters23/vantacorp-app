import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const process = Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await process.status();
    if (code !== 0) throw new Error("Failed to clear apt locks.");
}

async function checkTaskTimeout(startTime, timeout) {
    const elapsedTime = (Date.now() - startTime) / 1000;
    if (elapsedTime > timeout) throw new Error("Task execution exceeded time limit.");
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const startTime = Date.now();
        await checkTaskTimeout(startTime, 300);  // 5 minutes timeout.
        await clearAptLocks();  // Clear locks before execution.
        // Additional logic for task execution goes here.
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});