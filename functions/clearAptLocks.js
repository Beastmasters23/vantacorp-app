import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from "npm:child_process";

async function clearAPTLocks() {
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'];
    const results = [];

    for (const lockFile of lockFiles) {
        try {
            const { stdout } = await exec(`sudo rm -f ${lockFile}`);
            results.push({ file: lockFile, message: stdout });
        } catch (error) {
            results.push({ file: lockFile, error: error.message });
        }
    }
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const results = await clearAPTLocks();
        return Response.json({ clearedLocks: results }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});