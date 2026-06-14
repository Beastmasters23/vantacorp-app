import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForCommand(command) {
    const process = Deno.run({
        cmd: ["which", command],
        stdout: "piped",
        stderr: "piped"
    });
    const output = await process.output();
    const error = await process.stderrOutput();
    process.close();
    return output.length > 0;
}

async function recoverStuckTasks(taskId) {
    // Implement recovery logic for stuck tasks here
    console.log(`Recovering task: ${taskId}`);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const stuckTasks = await getStuckTasks(); // Placeholder for fetching stuck tasks
    for (const task of stuckTasks) {
        const commandAvailable = await checkForCommand(task.command);
        if (!commandAvailable) {
            console.error(`Command missing for task: ${task.id}`);
            await recoverStuckTasks(task.id);
        }
    }
    return Response.json({ message: 'Checked for stuck tasks and command availability.' }, { status: 200 });
});