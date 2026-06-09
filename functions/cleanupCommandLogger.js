import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function cleanupCommandLogger(command: string) {
    const { exec } = Deno;
    try {
        const results = await exec(command);
        console.log(`Command: ${command} executed successfully with output: ${results.stdout}`);
    } catch (error) {
        console.error(`Error executing command: ${command} with message: ${error.message}`);
        throw new Error(`Cleanup command failed: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const command = "your_cleanup_command_here"; // replace with actual command
        await cleanupCommandLogger(command);
        return Response.json({ status: 'Cleanup command executed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});