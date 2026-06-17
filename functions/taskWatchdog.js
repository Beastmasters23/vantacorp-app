import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_TASK_RUNTIME = 300; // define maximum task duration in seconds

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    try {
        // Validate commands before proceeding
        const requiredCommands = ['cat', 'your_other_commands'];
        const missingCommands = requiredCommands.filter(cmd => !(await commandExists(cmd)));
        if (missingCommands.length > 0) {
            throw new Error(`Missing commands: ${missingCommands.join(', ')}`);
        }
        
        // Check and limit task execution to prevent hanging
        const task = await startTask(); // mock function to start task
        const taskResult = await Promise.race([
            task,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Task exceeded maximum runtime')), MAX_TASK_RUNTIME * 1000))
        ]);

        if (taskResult) {
            return Response.json({ status: 'Task completed successfully', result: taskResult });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function commandExists(command) {
    const { stdout, code } = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    }).output();
    return code === 0;
}

async function startTask() {
    // Placeholder for the task execution logic
    // return some result or throw an error for different scenarios
}