import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const criticalCommands = ['CAT', 'echo', 'rm', 'ls']; // Add critical commands as necessary

async function isCommandAvailable(command) {
    try {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        return result.length > 0;
    } catch (error) {
        return false;
    }
}

async function logCommandAvailability() {
    for (let command of criticalCommands) {
        const available = await isCommandAvailable(command);
        if (!available) {
            console.error(`Command not available: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Log command availability before executing tasks
        await logCommandAvailability(); 
        return Response.json({ message: 'Command availability logged.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});