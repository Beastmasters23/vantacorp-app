import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const validateAndExecute = async (command) => {
    const requiredCommands = ['cat', 'echo']; // Add any other critical commands.
    const missingCommands = requiredCommands.filter(cmd => !Deno.run({ cmd: [cmd] }).status);  

    if (missingCommands.length > 0) {
        throw new Error(`Missing commands: ${missingCommands.join(', ')}`);
    }

    const process = Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped',
    });

    const { success } = await process.status();
    if (!success) {
        const rawError = await process.stderrOutput();
        const errorMessage = new TextDecoder().decode(rawError);
        throw new Error(`Command execution failed: ${errorMessage}`);
    }
    return await process.output();
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const command = req.url; // Assuming the command comes from the request URL.
    try {
        const output = await validateAndExecute(command);
        return Response.json({ output: new TextDecoder().decode(output) });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});