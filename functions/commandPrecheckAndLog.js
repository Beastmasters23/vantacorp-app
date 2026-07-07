import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Collect details about the command availability
        const commandsToCheck = ['cat', 'rm', 'echo', 'sudo']; // Add commands relevant to the tasks
        const unavailableCommands = [];

        for (const command of commandsToCheck) {
            const cmdCheck = Deno.run({
                cmd: [command, '--version'],
                stdin: 'null',
                stdout: 'null',
                stderr: 'null',
            });
            const status = await cmdCheck.status();
            if (!status.success) {
                unavailableCommands.push(command);
            }
            cmdCheck.close();
        }

        if (unavailableCommands.length > 0) {
            const errorMessage = `Missing commands: ${unavailableCommands.join(', ')}`;
            console.error(errorMessage);
            return Response.json({ error: errorMessage }, { status: 500 });
        }

        console.log('All commands available.');
        // Continue with task execution here
        // ... (insert task execution logic) ...

        return Response.json({ message: 'Tasks executed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});