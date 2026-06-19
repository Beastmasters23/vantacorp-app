import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkFilesExistence(files) {
    const fs = Deno;
    for (const file of files) {
        try {
            await fs.stat(file);
        } catch (error) {
            return false; // File doesn't exist or isn't accessible
        }
    }
    return true; // All files exist
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredFiles = ['/path/to/file1', '/path/to/file2']; // Specify required files here

    if (!(await checkFilesExistence(requiredFiles))) {
        return Response.json({ error: 'Required files are missing or not accessible.' }, { status: 500 });
    }

    try {
        // Proceed with task execution
        // Your task logic here...
        return Response.json({ status: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});