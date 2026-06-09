import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Function to check command availability and handle timeouts
async function checkAndExecuteCommand(command) {
    const { exec } = Deno;
    const timeout = 300; // timeout in seconds
    const process = Deno.run({
        cmd: command,
        stdout: "piped",
        stderr: "piped",
    });

    const { success } = await process.status();
    const output = await process.output();
    const errorOutput = await process.stderrOutput();
    process.close();

    if (!success) {
        throw new Error(new TextDecoder().decode(errorOutput));
    }

    return new TextDecoder().decode(output);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Example command to check
        const command = ['ls', '/usr/bin']; // replace with actual commands
        const result = await checkAndExecuteCommand(command);
        return Response.json({ success: true, output: result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});