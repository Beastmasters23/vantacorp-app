import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function retryCommand(command, retries) {
    for (let attempt = 0; attempt < retries; attempt++) {
        const { success, output, error } = await executeCommand(command);
        if (success) return { success, output };
        console.error(`Attempt ${attempt + 1} failed: ${error}`);
    }
    return { success: false, error: 'All attempts failed' };
}

async function executeCommand(command) {
    try {
        const process = Deno.run({
            cmd: command.split(" "),
            stdout: "piped",
            stderr: "piped"
        });
        const output = await process.output();
        const error = await process.stderrOutput();
        await process.status();
        return { success: true, output: new TextDecoder().decode(output), error: '' };
    } catch (err) {
        return { success: false, output: '', error: err.message };
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const command = "someCriticalCommand";
    const retries = 3;

    const result = await retryCommand(command, retries);
    if (!result.success) {
        return Response.json({ error: result.error }, { status: 500 });
    }
    return Response.json({ response: result.output });
});