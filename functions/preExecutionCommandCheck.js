import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandExists(command) {
    try {
        const process = Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = await process.output();
        const error = await process.stderrOutput();
        process.close();
        return output.length > 0; // returns true if the command exists
    } catch {
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cleanupCommand', 'verifyCommand', 'stopProcessesCommand']; // Add necessary commands
    const missingCommands = [];

    for (const command of commandsToCheck) {
        const exists = await commandExists(command);
        if (!exists) {
            missingCommands.push(command);
        }
    }

    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
    }

    // Continue with further task execution if all commands are present
    // ... (additional logic here)

    return Response.json({ message: 'All commands are available. Proceeding with tasks.' });
});