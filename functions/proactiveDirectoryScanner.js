import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkDirectoryAccess(directory) {
    try {
        const files = await Deno.readDir(directory);
        return Array.from(files).map(file => file.name);
    } catch (error) {
        return null;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const targetDirectories = ['/path/to/search1', '/path/to/search2']; // Replace with actual directories

    try {
        const results = {};
        for (const dir of targetDirectories) {
            const files = await checkDirectoryAccess(dir);
            results[dir] = files || 'Access Denied or Directory Not Found';
        }
        return Response.json(results);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});