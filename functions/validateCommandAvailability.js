import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const cmd of commands) {
        const checkCommand = Deno.run({
            cmd: [cmd],
            stdout: "null",
            stderr: "null"
        });
        const { code } = await checkCommand.status();
        if (code !== 0) {
            unavailableCommands.push(cmd);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ["cat", "rm", "ls", "echo"]; // Add commands relevant to your tasks
    const unavailableCommands = await checkCommandAvailability(commandsToCheck);

    if (unavailableCommands.length > 0) {
        return Response.json({ error: "Unavailable commands: " + unavailableCommands.join(', ') }, { status: 400 });
    }

    // Proceed with task execution if all commands are available
    try {
        // Place the task execution code here
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return new Response("Task executed successfully", { status: 200 });
});