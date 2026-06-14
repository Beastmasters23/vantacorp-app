import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkFileExists(filePath) {
    try {
        await Deno.stat(filePath);
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false;
        }
        throw error; // Re-throw unexpected errors
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredFiles = ['/vanta/bridge/teamwork_protocol.json', '/home/delgadofrankie139/vanta/vanta.log'];
    let missingFiles = [];

    for (const file of requiredFiles) {
        const exists = await checkFileExists(file);
        if (!exists) {
            missingFiles.push(file);
        }
    }

    if (missingFiles.length > 0) {
        return Response.json({ error: 'Missing files', missingFiles: missingFiles }, { status: 404 });
    }
    return Response.json({ message: 'All required files are present' });
});