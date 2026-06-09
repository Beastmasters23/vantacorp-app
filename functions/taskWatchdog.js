import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandAvailabilityCheck(command) {
    const response = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await response.output();
    const errorOutput = await response.stderrOutput();
    if (errorOutput.length > 0) {
        return false;
    }
    return output.length > 0;
}

async function taskWatchdog(taskId, command, retryCount = 3) {
    const taskTimeoutLimit = 60 * 1000; // 1 minute
    let startTime = Date.now();
    let taskRunning = true;

    while (taskRunning) {
        const commandAvailable = await commandAvailabilityCheck(command);
        if (!commandAvailable) {
            console.error(`Command ${command} is not available. Task: ${taskId} will fail.`);
            break;
        }

        if (Date.now() - startTime > taskTimeoutLimit) {
            console.warn(`Task ${taskId} has timed out. Attempting to retry...`);
            retryCount--;
            if (retryCount > 0) {
                startTime = Date.now(); // Reset timer for the new attempt
                continue; // Retry the task
            } else {
                console.error(`Task ${taskId} reached max retries and will fail.`);
                break;
            }
        }

        await new Promise(r => setTimeout(r, 5000)); // Sleep for 5 seconds before checking again.
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { taskId, command } = await req.json(); // Expecting a JSON body with taskId and command
    try {
        await taskWatchdog(taskId, command);
        return Response.json({ status: 'Task monitored successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});