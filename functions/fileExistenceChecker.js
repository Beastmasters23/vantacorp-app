import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkFileExists(filePath) {
    try {
        const stats = await Deno.stat(filePath);
        return stats.isFile;
    } catch (error) {
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const filesToCheck = ["/path/to/file1.txt", "/path/to/file2.txt"];  // Add paths to important files
    const results = {};

    for (const file of filesToCheck) {
        results[file] = await checkFileExists(file);
    }

    return Response.json({ fileCheckResults: results });
});