import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const lockFiles = ['/var/lib/apt/lists/lock', '/var/lib/dpkg/lock'];
    for (const file of lockFiles) {
        try {
            await Deno.remove(file);
        } catch (e) {
            if (e.name !== 'NotFound') {
                console.error(`Could not remove lock file: ${file}`, e);
            }
        }
    }
}

async function checkSudoPrivileges() {
    const process = Deno.run({
        cmd: ['sudo', '-n', 'true'],
        stderr: 'null',
    });

    const status = await process.status();
    process.close();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (!(await checkSudoPrivileges())) {
            return Response.json({ error: 'Sudo permissions are required to clear apt locks.' }, { status: 403 });
        }
        await clearAptLocks();
        return Response.json({ message: 'Apt lock files cleared and sudo verified.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});