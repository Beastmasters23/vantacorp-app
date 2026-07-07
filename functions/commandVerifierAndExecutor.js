import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndExecuteCommand(command) {
    const cmdAvailable = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    }).output();

    if (cmdAvailable.length === 0) {
        console.log('Command not found:', command);
        return { success: false, error: `Command not found: ${command}` };
    }

    const process = Deno.run({
        cmd: [command],
        stdout: 'piped',
        stderr: 'piped'
    });

    const { success } = await process.status();
    const output = await process.output();
    const errorOutput = await process.stderrOutput();

    return { success, output: new TextDecoder().decode(output), error: new TextDecoder().decode(errorOutput) };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandToExecute = 'your_command_here'; // Replace with the actual command you want to execute
    try {
        const result = await checkAndExecuteCommand(commandToExecute);
        if (!result.success) {
            return Response.json({ error: result.error }, { status: 500 });
        }
        return Response.json({ output: result.output }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});