import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAndInitializeNexus() {
    try {
        const command = "ip a"; // Command to list IPs
        const {stdout} = await runCommand(command);
        const assignedIPs = extractIPs(stdout);
        const nexusIP = '192.168.1.1'; // Example IP to initialize
        
        // Check for existing IPs
        if (assignedIPs.includes(nexusIP)) {
            console.log(`IP ${nexusIP} is already assigned, clearing it.`);
            await runCommand(`ip addr del ${nexusIP} dev nexus0`);
        }
        
        console.log('Initializing nexus0 interface...');
        await runCommand('ip link set nexus0 up'); // Example command to bring up the interface
        console.log('Nexus0 initialized successfully.');
    } catch (error) {
        console.error(`Error during initialization: ${error.message}`);
        throw error;
    }
}

function extractIPs(output) {
    const ipRegex = /(?:\d{1,3}\.){3}\d{1,3}/g;
    return output.match(ipRegex) || [];
}

async function runCommand(command) {
    return await exec(command);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAndInitializeNexus();
        return Response.json({ message: 'Nexus initialization invoked.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});