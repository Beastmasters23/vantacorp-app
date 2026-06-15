import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function checkEssentialCommands() {
    const essentialCommands = ['cat', 'echo']; // add other essential commands here
    return new Promise((resolve, reject) => {
        const missingCommands = [];
        essentialCommands.forEach(cmd => {
            if (Deno.run({ cmd: [cmd, '--version'] }).status() === 127) {
                missingCommands.push(cmd);
            }
        });
        if (missingCommands.length > 0) {
            reject(new Error(`Missing essential commands: ${missingCommands.join(', ')}`));
        } else {
            resolve(true);
        }
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkEssentialCommands();
        // Proceed with the task execution here
        return Response.json({ message: 'All essential commands are available.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});