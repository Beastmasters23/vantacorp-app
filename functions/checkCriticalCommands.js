import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function ensureCommandAvailability(command) {
    // Logic to check if a command exists in the current environment
    try {
        const output = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        const commandPath = new TextDecoder().decode(output);
        return commandPath.trim() !== '';
    } catch {
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const criticalCommands = ['cat', 'ls', 'echo']; // Add critical commands here

    for (const command of criticalCommands) {
        const isAvailable = await ensureCommandAvailability(command);
        if (!isAvailable) {
            console.warn(`Command not found: ${command}`);
            return Response.json({ error: `Missing command: ${command}` }, { status: 500 });
        }
    }

    // Proceed with intended task execution
    return Response.json({ message: 'All critical commands are available.' });
});