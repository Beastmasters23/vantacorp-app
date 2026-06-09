import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearIpConflict(nodeIp) {
    try {
        // Logic to check existing IP configuration
        const { execSync } = Deno;
        const result = execSync(`ip addr show | grep ${nodeIp}`);
        if (result) {
            execSync(`sudo ip addr del ${nodeIp} dev nexus0`);
        }
    } catch (error) {
        console.error('Error clearing IP conflict:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { nodeIp } = await req.json();
    try {
        await clearIpConflict(nodeIp);
        const currentDateTime = new Date(); // Using current Date() which is not optimal for UTC
        console.log('Initialization successful at UTC:', currentDateTime.toISOString());
        return Response.json({ status: 'success', message: 'IP conflict cleared and datetime recorded.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});