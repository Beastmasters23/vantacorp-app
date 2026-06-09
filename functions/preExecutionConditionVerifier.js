import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForAPTAndFiles(nodeId, requiredFiles) {
    try {
        const hasAPT = await checkForAPLocks(nodeId);
        if (hasAPT) return { hasIssue: true, message: 'APT lock present' };

        for (const file of requiredFiles) {
            const exists = await checkFileExistence(file);
            if (!exists) return { hasIssue: true, message: `File not found: ${file}` };
        }
        return { hasIssue: false }; 
    } catch (error) {
        throw new Error(`Error checking conditions: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { nodeId, requiredFiles } = await req.json();
        const result = await checkForAPTAndFiles(nodeId, requiredFiles);
        if (result.hasIssue) {
            return Response.json({ error: result.message }, { status: 400 });
        }
        return Response.json({ success: true, message: 'All conditions met!' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});