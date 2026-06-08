import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_THRESHOLD = 60 * 60 * 1000; // 60 minutes in milliseconds

    // Function to check and handle task timeouts
    async function handleTimeOutTask(taskID: string) {
        const task = await fetchTaskById(taskID); // mock function to fetch task details
        const currentTime = Date.now();
        if (task.status === "Running" && (currentTime - task.startTime) > TASK_TIMEOUT_THRESHOLD) {
            await resetTask(taskID); // mock function to reset or reinitialize the task
            return {success: true, message: `Task ${taskID} has been reset due to timeout.`};
        }
        return {success: false, message: `No timeout occurred for task ${taskID}.`};
    }

    try {
        const { taskID } = await req.json();
        const response = await handleTimeOutTask(taskID);
        return Response.json(response, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});