import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// List of critical commands that need to be monitored
const criticalCommands = ['CAT', 'curl', 'echo'];

async function checkCommandAvailability() {
    const missingCommands = [];
    for (const cmd of criticalCommands) {
        const isAvailable = await Deno.run({
            cmd: ["which", cmd],
            stdout: "null",
            stderr: "null"
        }).status();
        if (isAvailable.code !== 0) {
            missingCommands.push(cmd);
        }
    }
    if (missingCommands.length > 0) {
        throw new Error(`Missing critical commands: ${missingCommands.join(', ')}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkCommandAvailability(); // Check command availability before proceeding
        // Continue with task execution...
        return Response.json({ message: 'All systems go' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});