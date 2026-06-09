import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateCommandAndOutput(command, expectedOutputs) {
    const process = Deno.run({
        cmd: command.split(' '),
        stdout: "piped", 
        stderr: "piped",
    });
    const { code } = await process.status();

    const rawOutput = await process.output();
    const rawError = await process.stderrOutput();
    const output = new TextDecoder().decode(rawOutput);
    const errorOutput = new TextDecoder().decode(rawError);

    const outputValid = expectedOutputs.some(expected => output.includes(expected));

    process.close();

    if (code !== 0 || !outputValid) {
        throw new Error(`Command failed or output invalid: ${errorOutput || 'No output'}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Example commands and expected outputs
        const commands = [
            { cmd: 'ls /tmp', expected: ['vanta_task_TLGRla', 'task_data'] },
            { cmd: 'cat /yourfile.txt', expected: ['expected content'] }
        ];
        for (const { cmd, expected } of commands) {
            await validateCommandAndOutput(cmd, expected);
        }
        return Response.json({ message: "All commands executed successfully." });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});