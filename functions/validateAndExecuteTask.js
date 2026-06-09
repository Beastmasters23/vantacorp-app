import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateAndExecuteTask(taskCommand) {
    const essentialCommands = ['cat', 'echo', 'ls']; // List of essential commands
    for (const command of essentialCommands) {
        const isAvailable = await checkCommandAvailability(command);
        if (!isAvailable) {
            throw new Error(`Essential command ${command} is missing.`);
        }
    }
    const timeoutDuration = 300; // Setting timeout to 300 seconds
    const execResult = await executeWithTimeout(taskCommand, timeoutDuration);
    return execResult;
}

async function checkCommandAvailability(command) {
    const result = await Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null',
    }).status();
    return result.success;
}

async function executeWithTimeout(cmd, timeout) {
    const process = Deno.run({ cmd: [cmd] });
    const timer = new Promise((_, reject) => setTimeout(() => {
        process.kill();
        reject(new Error('Task execution timed out.')); 
    }, timeout * 1000));

    const result = await Promise.race([process.status(), timer]);
    if (!result.success) {
        throw new Error('Task execution failed.');
    }
    return result;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskCommand = 'cat /path/to/file'; // Example task
    try {
        const execResult = await validateAndExecuteTask(taskCommand);
        return Response.json({ message: 'Task executed successfully', data: execResult });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});