import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandExists(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stderr: 'piped',
        stdout: 'piped',
    });
    const status = await process.status();
    process.close();
    return status.success;
}

async function executeCommand(commandArray) {
    const command = commandArray[0];
    if (!(await commandExists(command))) {
        throw new Error(`Command not found: ${command}`);
    }
    const process = Deno.run({
        cmd: commandArray,
        stderr: 'piped',
        stdout: 'piped',
    });
    const output = await process.output();
    const errorOutput = await process.stderrOutput();
    const status = await process.status();
    process.close();
    if (!status.success) {
        throw new Error(new TextDecoder().decode(errorOutput));
    }
    return new TextDecoder().decode(output);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Example usage:
        const results = await executeCommand(['ls', '-la']);
        return Response.json({ results }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});