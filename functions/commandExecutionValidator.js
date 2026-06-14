import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const requiredCommands = ['cat', 'echo', 'grep']; // Add essential commands here

    const isCommandAvailable = (cmd) => {
        try {
            const p = Deno.run({
                cmd: ['which', cmd],
                stdout: 'null',
                stderr: 'null',
            });
            const status = await p.status();
            return status.success;
        } catch (error) {
            return false;
        }
    };

    const validateCommands = () => {
        const availableCommands = requiredCommands.every(isCommandAvailable);
        return availableCommands;
    };

    try {
        const commandsReady = validateCommands();
        if (!commandsReady) {
            return Response.json({ error: 'One or more required commands are unavailable.' }, { status: 500 });
        }
        // Additional code to proceed with task execution
        return Response.json({ message: 'All required commands are available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});