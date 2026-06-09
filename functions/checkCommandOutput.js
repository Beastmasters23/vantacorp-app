import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandOutput(command) {
    const { run } = Deno;
    const output = await run("/bin/bash", { 
        args: ['-c', command], 
        stdout: "piped", 
        stderr: "piped" 
    });

    const outputString = new TextDecoder().decode(await output.output());
    const errorString = new TextDecoder().decode(await output.stderrOutput());
    return { output: outputString.trim(), error: errorString.trim() };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Sample command verification
        const commandToCheck = "echo Hello, World!"; // Placeholder for the command you want to verify
        const { output, error } = await checkCommandOutput(commandToCheck);

        if (error) {
            return Response.json({ status: "error", message: error }, { status: 500 });
        }

        return Response.json({ status: "success", output: output });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});