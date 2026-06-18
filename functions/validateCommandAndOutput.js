import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const checkCommandOutput = async (command: string, expectedOutput: string) => {
    const process = Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await process.output();
    const error = await process.stderrOutput();
    process.close();
    return new TextDecoder().decode(output).trim() === expectedOutput && !error.length;
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Example: Check for a specific command and its expected output
        const command = 'some_command';
        const expectedOutput = 'Expected Output';
        const commandCheck = await checkCommandOutput(command, expectedOutput);
        if (!commandCheck) {
            throw new Error(`Command ${command} failed validation.`);
        }
        // Proceed with task execution...
        return Response.json({ message: 'Task executed successfully!' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});