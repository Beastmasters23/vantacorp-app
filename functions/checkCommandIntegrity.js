import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailable = [];
    for (const command of commands) {
        const commandCheck = await Deno.run({
            cmd: [command, '--version'], // Example command to check existence
            stdout: 'null',
            stderr: 'null',
        });
        const status = await commandCheck.status();
        commandCheck.close();
        if (!status.success) {
            unavailable.push(command);
        }
    }
    return unavailable;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'ls', 'grep']; // Update this list as needed

    try {
        const missingCommands = await checkCommandAvailability(requiredCommands);
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands detected: ' + missingCommands.join(', ') }, { status: 400 });
        }
        // Proceed with task execution if all commands are available
        // Your task execution logic here
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});