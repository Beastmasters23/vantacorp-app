import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const expectedOutputs = {
    'CAT': 'expected output for cat command', // Modify expected outputs as per actual commands
    // Add more commands and their expected outputs here
};

async function validateCommandOutput(command) {
    const output = await Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped',
    }).output();
    const decoder = new TextDecoder();
    const stdoutOutput = decoder.decode(output);
    return expectedOutputs[command.split(' ')[0]] ? stdoutOutput.includes(expectedOutputs[command.split(' ')[0]]) : true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToExecute = [
        'CAT',
        // Add commands you plan to validate
    ];
    try {
        for (const command of commandsToExecute) {
            const isValid = await validateCommandOutput(command);
            if (!isValid) {
                console.error(`Command: ${command} failed validation.`);
                return Response.json({ error: `${command} failed validation` }, { status: 400 });
            }
        }
        // Proceed with task execution
        // ...
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});