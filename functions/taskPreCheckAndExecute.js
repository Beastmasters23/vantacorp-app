import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const COMMANDS = ["cat", "ls", "pwd", "echo", "grep"]; // Add more critical commands as needed
const TIMEOUT_THRESHOLD = 60 * 1000;  // 60 seconds

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await validateCommands();
        const taskStartTime = Date.now();
        const output = await executeTask();
        if (Date.now() - taskStartTime > TIMEOUT_THRESHOLD) {
            throw new Error('Task exceeded time limit. Aborting.');
        }
        return Response.json({ result: output });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function validateCommands() {
    for (const command of COMMANDS) {
        try {
            const process = Deno.run({
                cmd: ["which", command],
                stdout: "piped",
                stderr: "piped",
            });
            const output = await process.output();
            if (output.length === 0) {
                throw new Error(`Command not found: ${command}`);
            }
        } catch (err) {
            console.error(err.message);
            throw new Error('Critical command validation failed.');
        }
    }
}

async function executeTask() {
    // Simulate task execution, replace this with actual task logic.
    return new Promise((resolve) => {
        setTimeout(() => resolve('Task executed successfully!'), 2000);
    });
}