import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commands = ['/bin/cat', '/usr/bin/env']; // Add any essential commands to check
        await validateCommandAvailability(commands);
        await validateScripts(['path/to/your/script.sh']); // Specify critical scripts to validate
        // Proceed with the intended task execution
        return Response.json({ message: 'Task executed successfully' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function validateCommandAvailability(commands) {
    for (const cmd of commands) {
        const cmdExists = await checkCommandExists(cmd);
        if (!cmdExists) {
            throw new Error(`Required command not found: ${cmd}`);
        }
    }
}

async function validateScripts(scripts) {
    for (const script of scripts) {
        const scriptExecutable = await checkScriptExecutable(script);
        if (!scriptExecutable) {
            throw new Error(`Required script not executable: ${script}`);
        }
    }
}

async function checkCommandExists(cmd) {
    const process = Deno.run({
        cmd: ['which', cmd],
        stdout: 'null',
        stderr: 'null',
    });
    const status = await process.status();
    process.close();
    return status.success;
}

async function checkScriptExecutable(script) {
    try {
        await Deno.stat(script);
        const process = Deno.run({
            cmd: [script],
            stdout: 'null',
            stderr: 'null',
        });
        const status = await process.status();
        process.close();
        return status.success;
    } catch { 
        return false;
    }
}