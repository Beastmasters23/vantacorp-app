import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ESSENTIAL_COMMANDS = ["ls", "cat", "echo", "mkdir", "rm", "curl", "wget"];  // Add more commands as necessary

async function checkCommandAvailability() {
    const missingCommands = [];
    for (const command of ESSENTIAL_COMMANDS) {
        const result = await Deno.run({
            cmd: ["which", command],
            stdout: "null",
            stderr: "null"
        }).status();
        if (!result.success) {
            missingCommands.push(command);
        }
    }
    return missingCommands.length === 0 ? true : missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const unavailableCommands = await checkCommandAvailability();
        if (unavailableCommands !== true) {
            return Response.json({
                error: "Missing commands: " + unavailableCommands.join(', ')
            }, { status: 500 });
        }
        // Execute the original task logic here
        return Response.json({ message: "All essential commands in place, task can proceed" });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});