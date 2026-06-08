import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForAptLocks() {
    const { exec } = Deno;
    const result = await exec("sudo fuser /var/lib/dpkg/lock");
    return result.code === 0; // 0 means locked
}

async function monitorRunningTasks() {
    const { exec } = Deno;
    const result = await exec("pgrep -f 'your_running_task_command'");
    return result.code === 0; // Checks if specific task is running
}

async function checkSystemResources() {
    const memory = Deno.memoryUsage();
    // Example check: ensure enough free memory
    return memory.rss < 512 * 1024 * 1024; // Example threshold of 512MB
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (await checkForAptLocks()) {
            return Response.json({ error: "Apt lock exists, please clear it before executing tasks." }, { status: 503 });
        }
        if (await monitorRunningTasks()) {
            return Response.json({ error: "There are still running tasks, please wait." }, { status: 503 });
        }
        if (!await checkSystemResources()) {
            return Response.json({ error: "Not enough system resources available to execute tasks." }, { status: 503 });
        }
        // Proceed with task execution if all checks pass
        return Response.json({ status: "All checks passed, proceed with task execution." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});