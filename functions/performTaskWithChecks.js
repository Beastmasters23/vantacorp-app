import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkFileAndOutput(path) {
    try {
        const response = await Deno.run({
            cmd: ['ls', path],
            stdout: 'piped',
            stderr: 'piped',
        });
        const output = await response.output();
        if (output.length === 0) {
            throw new Error('No files found in the specified path.');
        }
        return new TextDecoder().decode(output);
    } catch (error) {
        throw new Error(`File check failed: ${error.message}`);
    }
}

async function performTaskWithChecks(taskPath) {
    try {
        const files = await checkFileAndOutput(taskPath);
        // Proceed to execute the task if files are present
        console.log('Files found:', files);
        // Insert additional task execution logic here
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskPath = '/path/to/search'; // Example: Dynamic assignment might be needed
    try {
        await performTaskWithChecks(taskPath);
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});