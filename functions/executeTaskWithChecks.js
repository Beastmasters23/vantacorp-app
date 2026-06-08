import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const TASK_TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds

    const checkTaskStatus = async (taskId) => {
        // Simulated function to get task status and output;
        const taskStatus = await getTaskStatus(taskId);
        const currentTime = Date.now();
        if (taskStatus.running && (currentTime - taskStatus.startTime > TASK_TIMEOUT_THRESHOLD)) {
            await clearStuckTask(taskId);
            return { status: 'cleared', output: null };
        }
        return taskStatus;
    };

    const executeTaskWithChecks = async (taskId) => {
        const statusCheck = await checkTaskStatus(taskId);
        if (statusCheck.status === 'cleared') {
            return Response.json({ message: 'Task cleared due to timeout.' }, { status: 200 });
        }
        // Proceed with task execution if checks are passed.
        await executeTask(taskId);
        return Response.json({ message: 'Task executed successfully.' }, { status: 200 });
    };

    try {
        const taskId = await getTaskIdFromRequest(req);
        return await executeTaskWithChecks(taskId);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getTaskStatus(taskId) {
    // Dummy implementation to simulate getting task status.
    return { running: true, startTime: Date.now() - 70000 }; // Assume task has been running for 70 seconds.
}

async function clearStuckTask(taskId) {
    // Logic to clear a stuck task based on taskId.
    console.log(`Clearing stuck task: ${taskId}`);
}

async function executeTask(taskId) {
    // Logic to execute the task based on taskId.
    console.log(`Executing task: ${taskId}`);
}

async function getTaskIdFromRequest(req) {
    // Logic to extract task ID from the incoming request.
    return 'task-id-example';
}