import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from "https://deno.land/x/execute/mod.ts";

async function clearAptLocks() {
    try {
        await exec('sudo fuser -k /var/lib/dpkg/lock-frontend');
        await exec('sudo fuser -k /var/lib/dpkg/lock');
    } catch (error) {
        console.error('Error clearing apt locks:', error);
        throw new Error('Failed to clear apt locks');
    }
}

async function checkFileExists(filePath) {
    try {
        await Deno.stat(filePath);
        return true;
    } catch (e) {
        if (e.name === "NotFound") return false;
        throw e;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const importantFiles = ['/home/delgadofrankie139/vanta/agi_daemon.log', '/home/delgadofrankie139/vanta/output/hive_strategy.json'];
    try {
        await clearAptLocks();
        for (const file of importantFiles) {
            if (!await checkFileExists(file)) {
                throw new Error(`Critical file missing: ${file}`);
            }
        }
        // Proceed with task execution here...
        return Response.json({ success: true }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});