import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaFileTracker — robust workspace indexing and health checks.
 * Resolves recurring 'FILE_NOT_FOUND' gaps identified in Self-Teach cycle.
 */
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { action, target_node } = await req.json();

        if (action === 'index') {
            if (!target_node) return Response.json({ error: 'target_node required' }, { status: 400 });

            // Dispatch a task to crawl the workspace and generate a file map
            return await base44.asServiceRole.functions.invoke('vantaDispatchTask', {
                directive: "Generate a complete recursive file map of ~/vanta/, including permissions and sizes. Save to ~/vanta/system/file_index.json.",
                target_node,
                code: `#!/bin/bash
mkdir -p ~/vanta/system
echo "Indexing workspace..."
find ~/vanta -maxdepth 4 -not -path '*/.*' -printf '{"path":"%p","size":%s,"mode":"%M"}\\n' | jq -s '.' > ~/vanta/system/file_index.json
echo "PROGRESS:100"
echo "Index complete: $(wc -l < ~/vanta/system/file_index.json) records."`,
                language: 'bash'
            });
        }

        return Response.json({ status: 'ok', message: 'File tracker initialized.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});