import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPTLocks() {
    const command = 'sudo fuser -k /var/lib/dpkg/lock-frontend';
    try {
        const output = await executeCommand(command);
        return { success: true, output };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function executeCommand(command) {
    const process = Deno.run({
        cmd: command.split(' '),
        stdout: "pipe",
        stderr: "pipe",
    });
    const [output, error] = await Promise.all([
        process.output(),
        process.stderrOutput(),
        process.status
    ]);
    const status = await process.status();
    process.close();
    return { output: new TextDecoder().decode(output), error: new TextDecoder().decode(error), status };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check and clear APT locks
        const lockResult = await checkAndClearAPTLocks();
        if (!lockResult.success) {
            return Response.json({ error: lockResult.error }, { status: 500 });
        }
        // Proceed with further tasks if needed

        return Response.json({ success: true, message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});