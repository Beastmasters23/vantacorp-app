import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateCommandOutput(command: string, expectedOutput: string): Promise<boolean> {
    const process = Deno.run({
        cmd: [command],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await process.output();
    const error = await process.stderrOutput();
    process.close();

    const outputString = new TextDecoder().decode(output);
    const errorString = new TextDecoder().decode(error);

    if (errorString) {
        console.error(`Error executing command: ${errorString}`);
        return false;
    }
   
    return outputString.includes(expectedOutput);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const command = "your-command-here";  // Replace it with the actual command
        const expectedOutput = "expected-output"; // Replace with expected output
        const isValid = await validateCommandOutput(command, expectedOutput);

        if (!isValid) {
            return Response.json({ error: 'Command output validation failed.' }, { status: 400 });
        }

        // Continue with task execution.
        
        return Response.json({ message: 'Command executed successfully!' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});