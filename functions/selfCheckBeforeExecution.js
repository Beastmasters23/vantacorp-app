import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function selfCheckBeforeExecution() {
    // Function to check existing running tasks and system resources
    const runningTasks = await getRunningTasks();
    const resourcesAvailable = await checkSystemResources();

    if (runningTasks.length > 0) {
        console.log(`Found ${runningTasks.length} running tasks. Delaying new task execution.`);
        return false; // Delay new task execution
    }

    if (!resourcesAvailable) {
        console.log('Insufficient resources available. Cannot proceed with task execution.');
        return false; // Delay new task execution
    }

    console.log('All checks passed. System ready for new tasks.');
    return true; // Proceed with task execution
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const canExecute = await selfCheckBeforeExecution();
        if (!canExecute) {
            return Response.json({ message: 'Task execution delayed due to existing tasks or insufficient resources.' }, {status: 503});
        }
        // Code to execute your task goes here.
        return Response.json({ message: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});