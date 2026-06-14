import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkPreviousTasks() {
    const stillRunningTasks = await getRunningTasks(); // Function to get currently running tasks
    if (stillRunningTasks.length > 0) {
        await resolveStuckTasks(stillRunningTasks); // Function to resolve stuck tasks
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkPreviousTasks();
        // Place the code for executing new tasks here in the future
        return Response.json({ message: "Tasks checked and ready. Proceed with execution." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});