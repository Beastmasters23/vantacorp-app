import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkRequiredFiles(files) {
    const missingFiles = [];
    for (const file of files) {
        try {
            await Deno.stat(file);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                missingFiles.push(file);
            }
        }
    }
    return missingFiles;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredFiles = [
        '/usr/bin/cat',
        '/usr/bin/grep',
        '/usr/local/bin/some_script',  // Add other critical binaries/scripts as needed
    ];
    try {
        const missingFiles = await checkRequiredFiles(requiredFiles);
        if (missingFiles.length > 0) {
            return Response.json({ error: 'Missing required files: ' + missingFiles.join(', ') }, { status: 400 });
        }
        // Proceed with task execution if all files are present.
        return Response.json({ message: 'All required files are present. Task can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});