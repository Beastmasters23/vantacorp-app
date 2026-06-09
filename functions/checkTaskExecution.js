import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const essentialCommands = ['cat', 'grep', 'awk'];
        const maxExecutionTime = 300; // seconds

        // Check for essential command availability
        const commandCheckResults = await Promise.all(essentialCommands.map(cmd => Deno.run({
            cmd: [cmd, '--help'],
            stdout: 'null',
            stderr: 'null'
        }).status()));

        const allCommandsAvailable = commandCheckResults.every(result => result.success);
        if (!allCommandsAvailable) {
            throw new Error('One or more essential commands are not available.');
        }

        // Monitor task execution
        const startTime = Date.now();
        const task = await base44.performTask();
        const endTime = Date.now();

        if ((endTime - startTime) / 1000 > maxExecutionTime) {
            throw new Error('Task execution exceeded maximum allowed time.');
        }

        return Response.json({ success: true, result: task });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});