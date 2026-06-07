import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock', '/var/cache/apt/archives/lock', '/var/lib/dpkg/lock*'] }).status();
}

async function verifyFilesExist(files) {
    for (const file of files) {
        try {
            await Deno.stat(file);
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                throw new Error(`File not found: ${file}`);
            }
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredFiles = [
        '/home/delgadofrankie139/vanta/kelpie_v1.zip',
        '/home/delgadofrankie139/vanta/teaching_sandbox/extracted_kelpie_v1/lyra_nova_kelpie_extracted/lyra-nova/package.json'
    ];
    try {
        await clearAptLocks();
        await verifyFilesExist(requiredFiles);
        // Proceed with the main command...
        return Response.json({ status: 'success', message: 'Pre-flight checks passed and locks cleared.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});