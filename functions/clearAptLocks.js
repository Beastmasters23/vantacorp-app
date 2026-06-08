import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Function to clear apt locks
        const clearAptLocks = async () => {
            const result = await Deno.run({
                cmd: ['sudo', 'apt-get', 'clean'],
                stdout: 'piped',
                stderr: 'piped'
            }).output();
            return new TextDecoder().decode(result);
        };

        // Execute the clear apt locks function
        const output = await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared successfully', output }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});