import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateCommandOutput(command: string, expectedOutput: string): Promise<boolean> {
    const process = Deno.run({
        cmd: command.split(" "),
        stdout: "piped",
        stderr: "piped",
    });

    const output = await process.output();
    const error = await process.stderrOutput();

    const decoder = new TextDecoder();
    const outputStr = decoder.decode(output);
    const errorStr = decoder.decode(error);

    await process.status();

    if (errorStr) {
        console.error(`Error executing command: ${errorStr}`);
        return false;
    }

    return outputStr.includes(expectedOutput);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const command = "example_command"; // Replace with actual command
        const expectedOutput = "expected output here"; // Replace with required output

        const isValid = await validateCommandOutput(command, expectedOutput);

        if (!isValid) {
            return Response.json({ error: "Command did not produce expected output" }, { status: 400 });
        }

        // Execute cleanup or main task logic here
        // ...

        return Response.json({ success: true });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});