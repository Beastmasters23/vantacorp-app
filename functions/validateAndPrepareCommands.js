import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateCommands(commands) {
    const missingCommands = commands.filter(cmd => !Deno.run({ cmd: [cmd] }).status().then(status => status.success));
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'rm', 'echo']; // List of critical commands to validate

    try {
        const missingCommands = await validateCommands(commands);
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
        }
        // Continue with task execution, e.g., cleanup or other operations

        return Response.json({ message: 'All commands are available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});