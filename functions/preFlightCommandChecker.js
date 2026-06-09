import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// List of critical commands to check before executing tasks
const criticalCommands = ["cat", "ls", "chmod", "git", "curl"];  

async function checkCommandAvailability() {
    const missingCommands = [];
    for (const command of criticalCommands) {
        const commandExists = await Deno.run({
            cmd: ["which", command],
            stderr: "null",
        }).status();
        if (!commandExists.success) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const missing = await checkCommandAvailability();
        if (missing.length > 0) {
            return Response.json({ error: `Missing commands: ${missing.join(', ')}` }, { status: 400 });
        }
        // Proceed with task execution workflow here...
        return Response.json({ message: "All checks passed. Ready to execute tasks." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});