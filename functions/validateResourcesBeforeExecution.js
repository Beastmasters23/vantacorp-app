import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredProtocols = ['/vanta/bridge/lyra_nova_protocol.json', '/vanta/bridge/teamwork_protocol.json'];
    const requiredFiles = ['/vanta/bridge/hive_consensus_spec.json', '/vanta/bridge/sovereign_ai_security_whitepaper.json'];

    try {
        await validateResources(requiredProtocols, requiredFiles);
        return Response.json({ message: 'All resources validated successfully!' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function validateResources(protocols, files) {
    for (const protocol of protocols) {
        const protocolExists = await checkResourceExists(protocol);
        if (!protocolExists) {
            throw new Error(`Missing protocol: ${protocol}`);
        }
    }
    for (const file of files) {
        const fileExists = await checkResourceExists(file);
        if (!fileExists) {
            throw new Error(`Missing file: ${file}`);
        }
    }
}

async function checkResourceExists(resource) {
    try {
        const response = await fetch(resource);
        return response.ok;
    } catch {
        return false;
    }
}