import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function executeCommandSafely(command: string) {
    const output = await Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped',
    });

    const { code } = await output.status();
    const rawOutput = await output.output();
    const rawError = await output.stderrOutput();

    if (code !== 0) {
        console.error(new TextDecoder().decode(rawError));
        // Implement fallback or alternative action here if required
    }
    return new TextDecoder().decode(rawOutput);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandToExecute = req.url.split("/")[1]; // Example URI processing to get command
    try {
        const result = await executeCommandSafely(commandToExecute);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});