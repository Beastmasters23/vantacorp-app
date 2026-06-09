import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const resourceCheck = async () => {
        const { stdout, status } = await Deno.run({
            cmd: ['free', '-m'],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        const memory = new TextDecoder().decode(stdout);
        const totalMemory = parseInt(memory.split('\n')[1].split(/\+/)[1]);  
        const usedMemory = parseInt(memory.split('\n')[1].split(/\+/)[2]);
        return totalMemory - usedMemory > 100; // Check if there are at least 100MB free
    };

    try {
        const isResourcesSufficient = await resourceCheck();
        if (!isResourcesSufficient) {
            return Response.json({ error: 'Insufficient resources to execute tasks.' }, { status: 503 });
        }
        // Continue with task execution...
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});