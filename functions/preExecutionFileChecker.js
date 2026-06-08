import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkFilesExist(files: string[]): Promise<boolean> {
    for (const file of files) {
        try {
            await Deno.stat(file);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                console.error(`File not found: ${file}`);
                return false;
            }
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const filesToCheck = [
        '/path/to/expected/file1.txt',
        '/path/to/expected/file2.txt',
    ];
    const filesExist = await checkFilesExist(filesToCheck);
    if (!filesExist) {
        return Response.json({ error: 'One or more required files are missing.' }, { status: 404 });
    }
    try {
        // Execute your task here after validating files
        return Response.json({ success: 'Files are ready, task can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});