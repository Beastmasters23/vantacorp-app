import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkRequiredFiles(files) {
    const missingFiles = files.filter(file => !await Deno.stat(file).then(() => false).catch(() => true));
    return missingFiles;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredFiles = ["/path/to/lyra.def", "/path/to/weaver.def"];
    
    try {
        const missingFiles = await checkRequiredFiles(requiredFiles);
        if (missingFiles.length > 0) {
            return Response.json({ error: 'Missing files: ' + missingFiles.join(', ') }, { status: 500 });
        }
        // Proceed with task execution if all files present
        return Response.json({ message: 'All required files are present. Proceeding.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});