import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateAndExecute(req) {
    const base44 = createClientFromRequest(req);
    const COMMANDS_REQUIRED = ['cat', 'echo']; // Essential commands
    const MAX_RETRIES = 3;
    const RETRY_DELAY_BASE_MS = 1000;

    for (const command of COMMANDS_REQUIRED) {
        if (!(await commandExists(command))) {
            throw new Error(`Required command '${command}' is not available.`);
        }
    }

    let retryCount = 0;
    let success = false;
    while (retryCount < MAX_RETRIES && !success) {
        try {
            // Your task logic goes here. Replace 'executeTask()' with actual task execution logic.
            await executeTask(); // Placeholder for the actual task execution
            success = true;
        } catch (error) {
            retryCount++;
            console.warn(`Task failed, retrying ${retryCount}/${MAX_RETRIES} in ${Math.pow(2, retryCount) * RETRY_DELAY_BASE_MS}ms...`);
            await delay(Math.pow(2, retryCount) * RETRY_DELAY_BASE_MS);
        }
    }

    if (!success) {
        throw new Error('Task failed after maximum retries.');
    }
}

async function commandExists(command) {
    const p = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null'
    });
    const status = await p.status();
    return status.success;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
    try {
        await validateAndExecute(req);
        return Response.json({ message: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});