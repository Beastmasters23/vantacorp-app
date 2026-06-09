import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTTasks() {
    // Function to clear APT locks
    await Deno.run({
        cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock'],
    }).status();
    await Deno.run({
        cmd: ['sudo', 'rm', '/var/cache/apt/archives/lock'],
    }).status();
    await Deno.run({
        cmd: ['sudo', 'rm', '/var/lib/dpkg/lock*'],
    }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Attempt to clear APT locks
        await clearAPTTasks();
        // Further logic to monitor task execution and retry if command errors are detected
        const result = await executeTaskWithRetry();
        return Response.json(result);
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function executeTaskWithRetry() {
    // Replace with specific tasks
    const taskCommand = ['your-command-here'];
    let retries = 3;

    for (let i = 0; i < retries; i++) {
        const taskStatus = await Deno.run({
            cmd: taskCommand,
        }).status();

        if (taskStatus.success) {
            return { message: 'Task executed successfully!' };
        } else {
            console.warn(`Task failed, attempt ${i + 1}`);
            await clearAPTTasks();  // Try to clear APT locks after each failure
        }
    }
    throw new Error('Task failed after multiple attempts');
}