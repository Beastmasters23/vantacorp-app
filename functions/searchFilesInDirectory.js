import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Extract parameters if needed
        const searchTerms = ['Lyra', 'Weaver'];
        const directoryPath = "/path/to/search"; // Configure actual search path as needed
        
        const files = await Deno.readDir(directoryPath);
        let results = [];
        
        for await (const file of files) {
            if (file.isFile) {
                const filePath = `${directoryPath}/${file.name}`;
                const content = await Deno.readTextFile(filePath);
                for (const term of searchTerms) {
                    if (content.includes(term)) {
                        results.push({ file: file.name, content: content });
                    }
                }
            }
        }
        
        if (results.length === 0) {
            return Response.json({ message: "No matching files found." }, { status: 404 });
        }
        return Response.json({ results }, { status: 200 });
    } catch(error) {
        console.error('Failed to execute search:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});