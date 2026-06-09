import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateCommands(commands) {
    for (const command of commands) {
        const response = await Deno.run({
            cmd: ['command', '-v', command],
            stdout: 'null',
            stderr: 'null'
        }).status();
        if (!response.success) {
            throw new Error(`Command ${command} is not available.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'ls', 'grep']; // Add other essential commands as required
    const timeoutLimit = 300; // 5 minutes

    try {
        await validateCommands(essentialCommands);

        const taskExecution = await Deno.run({
            cmd: ['your-task-here'],
            stdout: 'piped',
            stderr: 'piped'
        });

        const timeoutCheck = await Promise.race([
            taskExecution.status(),
            new Promise((_, reject) => setTimeout(() => reject('Task execution timed out'), timeoutLimit * 1000))
        ]);

        if (!timeoutCheck.success) {
            throw new Error('Task execution failed or timed out.');
        }

        return Response.json({ message: 'Task executed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});