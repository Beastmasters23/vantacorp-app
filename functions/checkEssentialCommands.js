import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const essentialCommands = ['cat', 'rm', 'echo']; // Add essential commands here

async function checkEssentialCommands() {
    for (const command of essentialCommands) {
        try {
            // Try to spawn the command to check availability
            await Deno.run({ cmd: [command, '--version'] }).status();
        } catch {
            throw new Error(`Command not found: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkEssentialCommands();
        // Proceed with the task execution logic here...
        return Response.json({ message: "All commands available, proceeding with task execution." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});