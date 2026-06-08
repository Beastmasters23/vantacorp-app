import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        // Logic to check and clear APT locks
        const result = await Deno.run({
            cmd: ["sudo", "apt-get", "-y", "remove", "--purge", "apt-lock"],
            stdout: "piped",
            stderr: "piped",
        }).output();

        return new TextDecoder().decode(result);
    } catch (error) {
        console.error("Failed to clear APT locks:", error);
        throw new Error('APT lock clearance failed.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for tasks exceeding runtime limits
        const ongoingTasks = await base44.getActiveTasks();
        for (const task of ongoingTasks) {
            if (task.runtime > 60) { // 60 minutes threshold
                // Attempt to clear APT locks before retrying this task
                await clearAptLocks();
                // Retry or reset the task
                await base44.retryTask(task.id);
                console.log(`Task ${task.id} reset after timeout.`);
            }
        }
        return Response.json({ status: "checked tasks and handled locks" }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});