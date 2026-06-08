import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const MAX_EXECUTION_TIME = 60 * 1000;  // 60 seconds
    const RETRY_LIMIT = 3;  // Max retries
    const TIMEOUT_CHECK_INTERVAL = 5000;  // Check every 5 seconds

    const taskExecutionMap = new Map(); // To track ongoing tasks with their status

    async function executeTask(taskId, taskFunc) {
        let attempts = 0;
        while (attempts < RETRY_LIMIT) {
            const startTime = Date.now();
            taskExecutionMap.set(taskId, { status: 'running', startTime });

            try {
                await taskFunc();
                taskExecutionMap.set(taskId, { status: 'completed' });
                return true;
            } catch (error) {
                console.error(`Task ${taskId} failed: ${error.message}`);
                attempts++;
                if (attempts >= RETRY_LIMIT) {
                    taskExecutionMap.set(taskId, { status: 'failed' });
                    return false;
                }
            }

            // Check if task is taking too long
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime > MAX_EXECUTION_TIME) {
                console.warn(`Task ${taskId} exceeded max execution time. Attempting to terminate.`);
                taskExecutionMap.set(taskId, { status: 'timeout' });
                return false;
            }
        }
    }

    while (true) {
        // Simulate task fetching from a queue or directive
        const taskId = generateUniqueTaskId();
        await executeTask(taskId, myTaskFunction);

        await new Promise(resolve => setTimeout(resolve, TIMEOUT_CHECK_INTERVAL)); // Sleep before next task check
    }

    function generateUniqueTaskId() {
        return `task_${Date.now()}_${Math.random()}`;
    }

    async function myTaskFunction() {
        // Simulate a task that can fail or succeed
        if (Math.random() < 0.8) { // 80% chance to succeed
            console.log('Task completed successfully.');
        } else {
            throw new Error('Simulated random failure.');
        }
    }
});