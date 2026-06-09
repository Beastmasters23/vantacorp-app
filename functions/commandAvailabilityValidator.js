import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandAvailabilityValidator(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        try {
            const status = await Deno.run({
                cmd: [cmd],
                stdout: "null",
                stderr: "piped"
            });
            const { code } = await status.output();
            if (code !== 0) {
                missingCommands.push(cmd);
            }
        } catch (error) {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'echo', 'ls']; // add more commands as necessary
    const missingCommands = await commandAvailabilityValidator(essentialCommands);
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands found', missingCommands }, { status: 500 });
    }

    // Successful command validation, proceed with task execution or other logic
    return Response.json({ message: 'All commands available and valid' });
});