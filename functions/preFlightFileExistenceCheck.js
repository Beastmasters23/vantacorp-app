import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkFileExistence(filePaths) {
    const results = {};
    for (const filePath of filePaths) {
        try {
            await Deno.stat(filePath);
            results[filePath] = true;
        } catch (err) {
            results[filePath] = false;
        }
    }
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredFiles = ["/path/to/Lyra/file", "/path/to/Weaver/document"]; // specify needed files

    try {
        // Check if all required files exist
        const fileCheckResults = await checkFileExistence(requiredFiles);
        const missingFiles = Object.entries(fileCheckResults)
                                .filter(([_, exists]) => !exists)
                                .map(([file]) => file);

        if (missingFiles.length > 0) {
            return Response.json({ error: "Missing files", missingFiles }, { status: 400 });
        }
        // Continue with task execution if all files are found
        return Response.json({ success: "All required files are present." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});