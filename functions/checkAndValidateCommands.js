import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Define known essential commands
    const essentialCommands = ['cat', 'ls', 'echo'];

    // Function to check command availability
    const checkCommandAvailability = async (command) => {
        try {
            const process = Deno.run({
                cmd: ['which', command],
                stdout: 'null',
                stderr: 'null',
            });
            const status = await process.status();
            return status.success;
        } catch (error) {
            console.error(`Error checking command ${command}: ${error.message}`);
            return false;
        }
    };

    // Pre-execution command availability check
    const checkEssentialCommands = async () => {
        const missingCommands = [];
        for (const command of essentialCommands) {
            const available = await checkCommandAvailability(command);
            if (!available) {
                missingCommands.push(command);
            }
        }
        if (missingCommands.length > 0) {
            throw new Error(`Missing essential commands: ${missingCommands.join(', ')}`);
        }
    };

    try {
        await checkEssentialCommands();
        // Continue with task execution logic...
        return new Response('Commands available, task can proceed.', { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});