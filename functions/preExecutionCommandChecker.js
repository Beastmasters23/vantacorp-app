import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = commands.filter(command => !Deno.run({
        cmd: [command],
        stdout: "null",
        stderr: "null"
    }).status().success);
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ["cat", "echo", "ls", "grep"]; // Define critical commands

    try {
        const missingCommands = await checkCommandAvailability(requiredCommands);
        // Log the missing commands for better observability
        if (missingCommands.length > 0) {
            console.log("Missing commands:", missingCommands);
            return Response.json({ error: "Missing commands detected. Task execution halted.", missingCommands }, { status: 400 });
        }
        // Proceed with task execution if all commands are available
        // (Placeholder for further task execution logic)
        return Response.json({ success: "All commands are available. Proceeding with the task." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});