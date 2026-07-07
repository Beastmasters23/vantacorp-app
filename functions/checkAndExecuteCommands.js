import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndExecute(commands, task) {
    for (const command of commands) {
        const commandExists = await checkCommandAvailability(command);
        if (!commandExists) {
            console.error(`Command not found: ${command}`);
            return false;
        }
    }
    return await executeTask(task);
}

async function checkCommandAvailability(command) {
    const cmd = Deno.run({
        cmd: ['which', command],
        stderr: "null",
        stdout: "piped"
    });
    const output = await cmd.output();
    cmd.close();
    return new TextDecoder().decode(output).trim().length > 0;
}

async function executeTask(task) {
    // Ensure task execution is logged for observability.
    console.log(`Executing task: ${task}`);
    const result = await Deno.run({ cmd: task }).status();
    return result.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'ls', 'pwd'];  // replace with relevant commands for the tasks
    const task = ['some_command']; // replace with relevant task

    try {
        const taskSuccess = await checkAndExecute(commands, task);
        if (!taskSuccess) {
            return Response.json({ error: 'Task execution failed due to missing commands.' }, { status: 500 });
        }
        return Response.json({ message: 'Task executed successfully!' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});