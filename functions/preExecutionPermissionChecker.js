import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkPermissions(requiredPaths) {
    for (const path of requiredPaths) {
        try {
            const stat = await Deno.lstat(path);
            if (!(stat.mode & 0o200)) {
                throw new Error(`Permission denied for writing to ${path}`);
            }
        } catch (error) {
            throw new Error(`Error checking permissions for ${path}: ${error.message}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredPaths = ['/path/to/directory1', '/path/to/directory2']; // Update with actual paths
    try {
        await checkPermissions(requiredPaths);

        // Continue with task execution logic here.

    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});