import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const commandExists = Deno.run({
            cmd: ['which', command],
            stdout: 'null',
        });
        const { code } = await commandExists.status();
        if (code !== 0) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

async function retryTask(task, retries = 3) {
    for (let i = 0; i < retries; i++) {
        const result = await Deno.run({ cmd: task }).status();
        if (result.success) {
            return;
        }
        // Log the failure
        console.error(
            `Task ${task.join(' ')} failed. Attempt ${i + 1} of ${retries}`
        );
    }
    throw new Error(`Task ${task.join(' ')} failed after ${retries} attempts.`);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'grep', 'awk']; // Example critical commands

    try {
        const missingCommands = await checkCommandAvailability(commandsToCheck);
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
        }

        const task = req.body.task; // Assume task is received in the request body
        await retryTask(task);

        return Response.json({ success: 'Task completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});