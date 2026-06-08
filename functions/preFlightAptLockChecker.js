import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const processOutput = Deno.run({
            cmd: ['sh', '-c', 'ps -eo pid,cmd | grep -v grep | grep -c apt']
        });
        const { success } = await processOutput.status();
        if (success && (await processOutput.output()).length > 0) {
            return Response.json({ error: 'APT lock detected. Cannot proceed with tasks.', resolved: false }, { status: 503 });
        }

        // Proceed with normal task execution
        return Response.json({ message: 'No APT locks detected. Ready for execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});