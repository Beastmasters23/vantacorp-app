import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['sh', '-c', 'sudo apt-get remove -y lockfile || true'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { success } = await exec.status();
    const output = await exec.output();
    const error = await exec.stderrOutput();
    exec.close();

    if (!success) {
        throw new Error(`Failed to clear apt locks: ${new TextDecoder().decode(error)}`);
    }
    return new TextDecoder().decode(output);
}

async function checkCommandAvailability(command) {
    const exec = Deno.run({
        cmd: ['sh', '-c', `command -v ${command}`],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { success } = await exec.status();
    exec.close();
    return success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const command = "apt-get"; // Change this command as needed.
        const lockResult = await clearAptLocks();
        const commandAvailable = await checkCommandAvailability(command);
        if (!commandAvailable) {
            throw new Error(`${command} command is not available.`);
        }
        return Response.json({ message: 'APT locks cleared and command is available.', lockResult });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});