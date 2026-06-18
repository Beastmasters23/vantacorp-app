import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const requiredCommands = ["cat", "echo", "ls"]; // Add more commands as necessary
        const commandAvailability = {};

        for (const cmd of requiredCommands) {
            const cmdCheck = await Deno.run({
                cmd: [cmd, "--version"],
                stdout: "null",
                stderr: "null",
            }).status();
            commandAvailability[cmd] = cmdCheck.success;
        }

        const missingCommands = Object.entries(commandAvailability)
            .filter(([_, available]) => !available)
            .map(([cmd]) => cmd);

        if (missingCommands.length > 0) {
            return Response.json({ error: "Missing commands: " + missingCommands.join(', ') }, { status: 400 });
        }

        // If all commands are available, proceed with task execution...
        return new Response('All required commands are available.', { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});