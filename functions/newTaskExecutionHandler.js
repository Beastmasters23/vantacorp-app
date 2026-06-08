import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_LIMIT = 60 * 1000; // 60 seconds

async function clearAptLocks() {
    // Function to check and clear apt locks if any exist.
    const lockExists = await checkForAptLocks(); 
    if (lockExists) {
        await resolveAptLocks();
    }
}

async function manageTaskExecutionTimeout(taskFunction, ...args) {
    const taskPromise = taskFunction(...args);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => {
        reject(new Error('Task exceeded timeout limit.')); 
    }, TASK_TIMEOUT_LIMIT));
    return Promise.race([taskPromise, timeoutPromise]);
}

async function newTaskExecutionHandler(taskDirective) {
    await clearAptLocks();  // Ensure no apt locks exist before execution
    try {
        // Execute specific task under timeout management
        await manageTaskExecutionTimeout(executeDirective, taskDirective);
    } catch (error) {
        // Handle task errors effectively
        console.error(`Task execution failed: ${error.message}`);
        // Optionally: Add logic to notify admins or retry failed tasks
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskDirective = await req.json();  // Assuming directive is sent in json body
    try {
        await newTaskExecutionHandler(taskDirective);
        return Response.json({ status: 'success' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});