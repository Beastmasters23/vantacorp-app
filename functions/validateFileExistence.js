import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateFileExistence(filePaths: string[]): Promise<boolean> {
    for (const path of filePaths) {
        try {
            const exists = await Deno.stat(path);
            if (!exists) return false;
        } catch { 
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const filePaths = ["/path/to/Lyra", "/path/to/Weaver", "/path/to/maritime"]; // Add relevant paths
    try {
        const filesExist = await validateFileExistence(filePaths);
        if (!filesExist) {
            throw new Error('One or more specified files do not exist.');
        }
        // Continue with the original task workflow 
        return Response.json({ message: 'Files validated successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});