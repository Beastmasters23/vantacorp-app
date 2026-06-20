import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const results = await Promise.all(commands.map(async (cmd) => {
        const response = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        return response.length > 0;
    }));
    return results.every(result => result);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'grep', 'rm']; // Add other commands as necessary
    const isAvailable = await checkCommandAvailability(requiredCommands);
    
    if (!isAvailable) {
        return Response.json({ error: 'One or more required commands are missing.' }, { status: 500 });
    }
    
    // Perform cleanup operations safely
    try {
        // Logic for cleanup tasks goes here
        // For example: await Deno.run({ cmd: ['rm', '-rf', '/path/to/dir'] }).status();
        return Response.json({ message: 'Cleanup completed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});