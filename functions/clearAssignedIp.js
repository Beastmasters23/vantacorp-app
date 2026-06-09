import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAssignedIP(ipAddress) {
    // Function to clear any existing assignments of the given IP address
    const cmd = `ip addr flush dev ${ipAddress}`;
    const { success } = await Deno.run({
        cmd: ['bash', '-c', cmd],
        stdout: 'null',
        stderr: 'inherit',
    }).status();
    return success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const ipToClear = "nexus0"; // Adjust as necessary based on current context
    try {
        const cleared = await clearAssignedIP(ipToClear);
        if (!cleared) {
            throw new Error('Failed to clear the assigned IP address. Please check the network interface status.');
        }
        return Response.json({ message: 'IP address clearance successful.'}, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});