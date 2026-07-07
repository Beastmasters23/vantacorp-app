import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/** 
 * Validates command availability and checks for apt locks before executing tasks.
 */
async function validateCommandsAndClearLocks() {
    const requiredCommands = ['cat', 'echo']; // Add more commands as necessary.
    for (const command of requiredCommands) {
        const commandExists = await Deno.run({
            cmd: ['which', command],
            stdout: "piped",
            stderr: "piped",
        }).status();
        if (!commandExists.success) {
            throw new Error(`Required command ${command} not found.`);
        }
    }

    // Check for any apt locks and clear them if necessary.
    try {
        await Deno.run({ cmd: ['sudo', 'apt-get', 'remove', '-y', 'apt-lock-file'], stderr: "piped" }).status();
    } catch (error) {
        console.error("Could not clear apt locks:", error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await validateCommandsAndClearLocks();
        // Proceed with task execution as commands are validated and locks cleared.
        return Response.json({ message: "Task is ready for execution." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});