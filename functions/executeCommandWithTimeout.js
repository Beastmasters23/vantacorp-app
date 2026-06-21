import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const COMMAND_TIMEOUT = 300;  // 5 minutes

async function executeCommandWithTimeout(command) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Command '${command}' timed out.`));
        }, COMMAND_TIMEOUT * 1000);

        Deno.run({
            cmd: command.split(" "),
            stdout: "piped",
            stderr: "piped"
        }).status().then(status => {
            clearTimeout(timeoutId);
            if (status.success) {
                resolve();
            } else {
                reject(new Error(`Command '${command}' failed with exit code ${status.code}.`));
            }
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const command = "some_command_here";  // Example command
    try {
        await executeCommandWithTimeout(command);
        return Response.json({ message: `Successfully executed '${command}'` });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});