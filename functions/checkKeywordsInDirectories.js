import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const directories = ['/path/to/dir1', '/path/to/dir2']; // Specify search directories
        const keywords = ['Lyra', 'Weaver', 'maritime']; // Specify keywords to check

        // Check the existence of files containing the keywords
        for (const dir of directories) {
            const files = await Deno.readDir(dir);
            for await (const file of files) {
                if (file.isFile && keywords.some(keyword => file.name.includes(keyword))) {
                    console.log(`Found keyword in: ${file.name}`);
                }
            }
        }
        return Response.json({ success: 'Keyword search completed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});