import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandOutputLog = [];

    const executeAndLogCommand = async (command) => {
        try {
            const output = await Deno.run({
                cmd: command.split(" "),
                stdout: "piped",
                stderr: "piped"
            }).output();

            commandOutputLog.push({ command, output: new TextDecoder().decode(output) });
        } catch (error) {
            commandOutputLog.push({ command, error: error.message });
        }
    };

    const tasks = [
        "yourCommand1",
        "yourCommand2",
        // Add additional commands to monitor here
    ];

    for (const task of tasks) {
        await executeAndLogCommand(task);
    }

    return Response.json({ commandOutputLog }, { status: 200 });
});