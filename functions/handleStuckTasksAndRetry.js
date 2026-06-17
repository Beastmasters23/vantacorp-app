import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TIMEOUT_LIMIT = 3600; // 60 minutes in seconds
    const RETRY_COUNT = 3;

    async function handleStuckTasks() {
        const tasks = await getRunningTasks();  // A function to retrieve running task information
        for (const task of tasks) {
            if (task.runningTime > TIMEOUT_LIMIT) {
                await clearTask(task.id); // Clear stuck task
                await retryTask(task.id); // Retry the task
            }
        }
    }

    async function retryTask(taskId) {
        for (let attempt = 0; attempt < RETRY_COUNT; attempt++) {
            const result = await reexecuteTask(taskId);  // A function to re-execute the task
            if (result.success) {
                break;  // Exit loop on success
            }
            await delay(5000); // Wait before next retry
        }
    }

    try {
        await handleStuckTasks(); // Check and handle stuck tasks
        return Response.json({ success: "Handled stuck tasks successfully." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getRunningTasks() {
    // Dummy function to simulate fetching running tasks
    return [{ id: 1, runningTime: 4000 }]; // Example of a stuck task
}

async function clearTask(taskId) {
    // Dummy function to simulate clearing a stuck task
    console.log(`Cleared task ${taskId}`);
}

async function reexecuteTask(taskId) {
    // Dummy function to simulate re-execution of a task
    console.log(`Attempting to re-execute task ${taskId}`);
    return { success: true };  // Simulating success
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}