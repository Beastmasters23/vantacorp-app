import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ["sh", "-c", command],
        stderr: "null",
        stdout: "null"
    });
    const status = await process.status();
    process.close();
    return status.success;
}

async function monitorTaskExecution(taskCommand, timeout = 300) {
    let commandAvailable = await checkCommandAvailability(taskCommand);
    if (!commandAvailable) {
        throw new Error(`Required command for task not available: ${taskCommand}`);
    }

    const start = Date.now();
    const process = Deno.run({
        cmd: ["sh", "-c", taskCommand],
        stdout: "piped",
        stderr: "piped"
    });

    const timer = setTimeout(() => {
        process.kill(Deno.Signal.SIGTERM);
    }, timeout * 1000);

    const output = await process.output();
    clearTimeout(timer);
    const status = await process.status();
    process.close();

    if (!status.success) {
        throw new Error(`Task failed: ${new TextDecoder().decode(output)}`);
    }
    const duration = (Date.now() - start) / 1000;
    console.log(`Task completed successfully in ${duration} seconds`);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskCommand = "cat somefile.txt"; // Example command to run
    try {
        await monitorTaskExecution(taskCommand);
        return Response.json({ message: "Task executed successfully." });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});