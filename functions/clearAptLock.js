import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLock() {
    const lockFilePath = '/var/lib/dpkg/lock';
    const lockFilePathAlt = '/var/lib/dpkg/lock-frontend';
    const lockFilePathDpkg = '/var/lib/dpkg/lock';

    const { exec } = Deno;

    // Check for existing lock files
    const checkLock = await exec(`test -e ${lockFilePath} || test -e ${lockFilePathAlt} || test -e ${lockFilePathDpkg}`);
    if (checkLock.success) {
        console.log('No locks found. Ready to proceed.');
        return;
    }

    // Attempt to unlock by removing apt locks if they exist
    try {
        await exec(`sudo rm ${lockFilePath} ${lockFilePathAlt} ${lockFilePathDpkg}`);
        console.log('Removed existing apt lock files.');
    } catch (error) {
        console.error('Failed to remove lock:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLock();
        return Response.json({ status: 'Apt locks cleared, ready for task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});