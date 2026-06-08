import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT = 30000; // Time limit for tasks (30 seconds)
const APT_LOCK_CLEAR_COMMAND = 'sudo rm -rf /var/lib/apt/lists/lock';  // Command to clear APT locks

function clearAptLocks() {
    // Implementation detail for executing the APT lock clearance command 
    Deno.run({ cmd: APT_LOCK_CLEAR_COMMAND.split(' ') });
}

async function taskExecutionManager() {
    // Clear APT locks before executing any task
    clearAptLocks(); 

    const tasks = await getActiveTasks(); // Function to fetch current running tasks
    for (const task of tasks) {
        const taskStatus = await task.getStatus();
        if (taskStatus === 'running') {
            const isStuck = await checkIfTaskIsStuck(task.createdAt); // Function checks if the task is stuck based on its creation time
            if (isStuck) {
                await task.terminate();
            }
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await taskExecutionManager(); // Execute the task manager function
        return Response.json({ message: 'Task execution manager completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});