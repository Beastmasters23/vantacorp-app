import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await runCommand('sudo fuser -k /var/lib/dpkg/lock-frontend');
    return result;
}

async function checkForAptLock() {
    const result = await runCommand('test -f /var/lib/dpkg/lock-frontend && echo "Locked"');
    return result.includes('Locked');
}

async function runCommand(command) {
    const process = Deno.run({
        cmd: ['bash', '-c', command],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await process.output();
    const error = await process.stderrOutput();
    process.close();
    if (error.length) throw new Error(new TextDecoder().decode(error));
    return new TextDecoder().decode(output);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (await checkForAptLock()) {
            await clearAptLocks();
        }
        return Response.json({ message: 'Apt locks checked and cleared if necessary.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});