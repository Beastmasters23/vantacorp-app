import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function commandOutputCheck(command: string): Promise<boolean> {
        const process = Deno.run({
            cmd: [command],
            stdout: 'piped',
            stderr: 'piped',
        });
        const { code } = await process.status();
        const rawOutput = await process.output();
        const rawError = await process.stderrOutput();
        const output = new TextDecoder().decode(rawOutput);
        const errorOutput = new TextDecoder().decode(rawError);

        if (code !== 0) {
            console.error(`Command failed with error: ${errorOutput}`);
            return false;
        }
        console.log(`Command succeeded with output: ${output}`);
        return true;
    }

    try {
        // Example command usage check
        const isCurlAvailable = await commandOutputCheck('curl');
        if (!isCurlAvailable) {
            return Response.json({ error: 'curl command is required but not available.' }, { status: 500 });
        }
        // Further task handling can depend on the output check
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});