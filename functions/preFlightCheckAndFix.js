import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        await checkFileExistence(['/home/delgadofrankie139/vanta/lyra_client/lyra_client.py', '/home/delgadofrankie139/vanta/sovereign/sovereign_logic.py', '/home/delgadofrankie139/vanta/agi_daemon.log']);
        return Response.json({ message: 'Pre-flight checks passed, tasks can proceed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function clearAptLocks() {
    // Logic to check and clear apt locks
    const command = 'sudo fuser -k /var/lib/dpkg/lock';
    await executeCommand(command);
}

async function checkFileExistence(files) {
    for (const file of files) {
        try {
            await Deno.stat(file);
        } catch (error) {
            throw new Error(`File not found: ${file}`);
        }
    }
}

async function executeCommand(command) {
    // Logic for executing shell commands
    const process = Deno.run({
        cmd: ['sh', '-c', command],
        stdout: 'piped',
        stderr: 'piped'
    });

    const { success } = await process.status();
    if (!success) {
        const rawError = await process.stderrOutput();
        const errorString = new TextDecoder().decode(rawError);
        throw new Error(`Command failed: ${errorString}`);
    }
    await process.close();
}