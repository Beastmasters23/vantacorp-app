import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const checkCommand = async (command) => {
        const process = Deno.run({
            cmd: ["which", command],
            stdout: "piped",
            stderr: "piped"
        });
        const output = await process.output();
        const error = await process.stderrOutput();

        process.close();
        const commandExists = output.length > 0;

        if (!commandExists) {
            console.error(`Command ${command} not found.`);
            return false;
        }
        return true;
    };

    const executeTask = async (command) => {
        const valid = await checkCommand(command);
        if (!valid) {
            return Response.json({ error: `Command ${command} is not available. Aborting.` }, { status: 400 });
        }

        const task = Deno.run({
            cmd: command.split(" "),
            stdout: "piped",
            stderr: "piped"
        });

        const [output, error] = await Promise.all([task.output(), task.stderrOutput()]);
        task.close();

        if (output.length === 0) {
            return Response.json({ error: `No output returned for command: ${command}.` }, { status: 400 });
        }

        return Response.json({ success: true, output: new TextDecoder().decode(output) });
    };

    try {
        const commandToExecute = "your-command-here"; // Replace with actual command
        return await executeTask(commandToExecute);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});