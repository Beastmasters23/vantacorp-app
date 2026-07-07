import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkFileExistence(paths) {
    const fs = Deno;
    const results = {};
    for (const path of paths) {
        try {
            await fs.stat(path);
            results[path] = true;
        } catch (error) {
            results[path] = false;
        }
    }
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredFiles = ['path/to/your/file1', 'path/to/your/file2', 'path/to/your/file3'];
    try {
        const fileStatus = await checkFileExistence(requiredFiles);
        return Response.json(fileStatus);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});