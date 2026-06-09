import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateAndExecute(command) {
    const expectedOutputs = {
        'CAT': 'file content',  // example expected output
        // other commands and expected outputs can be added here
    };
    const [cmd, ...args] = command.split(' ');
    // Check if command exists
    if (!Deno.run({ cmd: ['which', cmd] }).status().then(status => status.success)) {
        throw new Error(`Command ${cmd} not found`);
    }
    // Execute the command
    const p = Deno.run({ cmd: [cmd, ...args], stdout: 'piped', stderr: 'piped' });
    const output = new TextDecoder().decode(await p.output());
    const error = new TextDecoder().decode(await p.stderrOutput());
    if (error) {
        throw new Error(`Error: ${error.trim()}`);
    }
    // Validate output
    if (expectedOutputs[cmd] && output.trim() !== expectedOutputs[cmd]) {
        throw new Error(`Unexpected output from ${cmd}: ${output.trim()}`);
    }
    return output;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
       // Example command execution
       const command = 'CAT somefile.txt';
       const result = await validateAndExecute(command);
       return Response.json({ output: result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});