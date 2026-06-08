import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

deno.runPreFlightCheck = async function(){
    const res = await executeCommand('sudo lsof /var/lib/dpkg/lock-active');
    return res.length === 0;
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const preflightSuccess = await deno.runPreFlightCheck();
        if (!preflightSuccess) {
            throw new Error('APT lock detected, cannot execute tasks.');
        }
        // Proceed with task execution
        // ... existing task logic 
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});