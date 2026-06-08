import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { resolve } from 'std/path';
import { exists } from 'std/fs';

async function checkFileAccessibility(filePaths) {
    for (const path of filePaths) {
        const resolvedPath = resolve(path);
        if (!(await exists(resolvedPath))) {
            console.error(`File does not exist: ${resolvedPath}`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const tasksFilePaths = ["/path/to/task/file1", "/path/to/task/file2"]; // Update with actual paths

    try {
        const filesAccessible = await checkFileAccessibility(tasksFilePaths);
        if (!filesAccessible) {
            return Response.json({ error: 'One or more required files are not accessible.' }, { status: 404 });
        }

        // Proceed with normal task execution logic here...
        return Response.json({ message: 'All necessary files are accessible' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});