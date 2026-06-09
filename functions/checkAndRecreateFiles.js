import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredFiles = [
        '/home/delgadofrankie139/vanta/bridge/inbox.json',
        '/home/delgadofrankie139/vanta/bridge/teamwork_protocol.json'
    ];

    try {
        for (const file of requiredFiles) {
            const exists = await fileExists(file);
            if (!exists) {
                console.log(`File missing: ${file}. Attempting to recreate.`);
                await createFile(file);
            }
        }
        // Proceed with normal operations
        return Response.json({ message: 'All required files are present.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function fileExists(filePath) {
    try {
        await Deno.stat(filePath);
        return true;
    } catch {
        return false;
    }
}

async function createFile(filePath) {
    const encoder = new TextEncoder();
    const data = encoder.encode('{}'); // Creating a JSON file with empty content
    await Deno.writeFile(filePath, data);
    console.log(`Recreated file: ${filePath}`);
}