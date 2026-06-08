import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkDirectoryAccessibility(directory: string): Promise<boolean> {
    try {
        const stat = await Deno.stat(directory);
        return stat.isDirectory && (stat.mode & 0o444) !== 0; // Check for read permissions
    } catch (error) {
        console.error(`Accessibility check failed for ${directory}: ${error.message}`);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const directoriesToCheck = ['/path/to/search/1', '/path/to/search/2']; // Example directories
    const results = await Promise.all(directoriesToCheck.map(checkDirectoryAccessibility));

    const inaccessibleDirs = directoriesToCheck.filter((_, index) => !results[index]);
    if (inaccessibleDirs.length) {
        return Response.json({ errors: inaccessibleDirs.map(dir => `Inaccessible: ${dir}`) }, { status: 403 });
    }

    // Continue with task execution...
    return Response.json({ success: 'All directories are accessible.' });
}, { port: 8000 });