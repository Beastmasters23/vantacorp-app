import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const checkResourceAvailability = async (resources) => {
        const unavailableResources = [];
        for (const resource of resources) {
            const exists = await fetch(`/check/${resource}`);
            if (!exists.ok) {
                unavailableResources.push(resource);
            }
        }
        return unavailableResources;
    };

    try {
        const resourcesToCheck = ["lyraNovaBridgeProtocol", "teamwork_protocol.json", "sovereignAIWhitepaper", "hiveConsensusSpec"];  
        const unavailable = await checkResourceAvailability(resourcesToCheck);

        if (unavailable.length > 0) {
            return Response.json({ error: "Missing resources", unavailable }, { status: 404 });
        }

        return Response.json({ message: "All resources are available" }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});