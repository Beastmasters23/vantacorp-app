import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkFileAccessibility(files) {
    return Promise.all(files.map(async (file) => {
        try {
            const response = await Deno.stat(file);
            return response ? true : false;
        } catch (error) {
            return false;
        }
    }));
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const filesToCheck = ['path/to/file1', 'path/to/file2', 'path/to/file3']; // Add necessary files here
    try {
        const results = await checkFileAccessibility(filesToCheck);
        const allAccessible = results.every(Boolean);
        
        if (!allAccessible) {
            throw new Error('One or more required files are inaccessible.');
        }
        // Continue with task execution...
        return Response.json({ message: 'All files accessible, proceeding with task.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});