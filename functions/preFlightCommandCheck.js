import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandExists(command) {
    const p = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null'
    });
    const status = await p.status();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo']; // Add necessary commands here

    for (const command of requiredCommands) {
        const cmdExists = await checkCommandExists(command);
        if (!cmdExists) {
            return Response.json({ error: `Required command ${command} not found.` }, { status: 400 });
        }
    }

    // Place existing task execution code here following command checks.
    // ...

    try {
        // Example task execution placeholder
        return Response.json({ message: 'Task executed successfully!' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});