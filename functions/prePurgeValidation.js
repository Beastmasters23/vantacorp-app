import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function prePurgeValidation() {
    const activeServices = await checkActiveServices();
    const logs = [];

    if (activeServices.length) {
        logs.push(`Active services present: ${activeServices.join(', ')}`);
        return { success: false, logs };
    }

    return { success: true, logs };
}

async function runPurgeTask() {
    const { success, logs } = await prePurgeValidation();
    if (!success) {
        console.error(logs.join('\n'));
        return Response.json({ error: 'Purge halted due to active services.', logs }, { status: 400 });
    }

    // Proceed with the purge task...

    return Response.json({ message: 'Purge completed successfully.' });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for the specific purge directive in the request
given/directive = req.headers.get('directive');
        if (directive === 'purge') {
            return await runPurgeTask();
        }

        return Response.json({ error: 'Invalid directive.' }, { status: 400 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});