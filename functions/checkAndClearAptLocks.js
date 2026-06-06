import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const cmd = Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock* && sudo rm -f /var/lib/dpkg/lock*'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await cmd.status();
    if (code !== 0) {
        const rawError = await cmd.stderrOutput();
        const errorString = new TextDecoder().decode(rawError);
        throw new Error(`Failed to clear apt locks: ${errorString}`);
    }
    cmd.close();
}

async function checkSudoPrivileges() {
    const cmd = Deno.run({
        cmd: ['sudo', '-n', 'true'],
        stderr: 'piped',
    });
    const { code } = await cmd.status();
    if (code !== 0) {
        throw new Error('Sudo privileges are required for this operation.');
    }
    cmd.close();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkSudoPrivileges();
        await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared and sudo privileges verified.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});