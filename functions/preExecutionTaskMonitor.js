import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds

    // Function to check and restart hanging systemd services
    async function checkAndRestartServices(serviceName) {
        const { success } = await Deno.run({
            cmd: [`systemctl`, `is-active`, serviceName],
            stdout: "piped",
            stderr: "piped"
        }).status();
        if (!success) {
            await Deno.run({
                cmd: [`systemctl`, `restart`, serviceName]
            }).status();
        }
    }

    const tasks = await getTasks(); // Hypothetical function to get current running tasks

    for (const task of tasks) {
        let timeout = setTimeout(async () => {
            await checkAndRestartServices(task.serviceName);
            console.log(`Task ${task.id} restarted due to timeout.`);
        }, TIMEOUT_THRESHOLD);

        try {
            await task.execute(); // Hypothetical task execution
            clearTimeout(timeout);
        } catch (error) {
            console.error(`Task ${task.id} failed:`, error);
        }
    }

    return Response.json({ status: "Success" });
});
