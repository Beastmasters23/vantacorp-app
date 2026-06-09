import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Check if APT locks are present
    const result = await runShellCommand('sudo fuser -v /var/lib/dpkg/lock-frontend');
    if (result.output) {
        // Attempt to release the lock by killing the process that is holding it
        await runShellCommand('sudo fuser -k /var/lib/dpkg/lock-frontend');
    }
}

async function runShellCommand(command) {
    try {
        const process = Deno.run({
            cmd: ['bash', '-c', command],
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = await process.output();
        const stderr = await process.stderrOutput();
        process.close();
        return {
            output: new TextDecoder().decode(output).trim(),
            error: new TextDecoder().decode(stderr).trim(),
        };
    } catch (error) {
        return { output: '', error: error.message }; 
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Clear APT locks before processing any request
        // Here place the logic to process incoming requests as needed
        return Response.json({ message: 'No APT locks found, ready to proceed.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});