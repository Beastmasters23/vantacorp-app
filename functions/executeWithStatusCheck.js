import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function checkComponentStatus(components) {
        const statuses = {};
        for (const component of components) {
            try {
                const response = await fetch(`http://${component}/status`);
                if (!response.ok) throw new Error(`Component ${component} not reachable`);
                statuses[component] = await response.json();
            } catch (error) {
                statuses[component] = { error: error.message, ok: false };
            }
        }
        return statuses;
    }

    async function executeWithStatusCheck() {
        const components = ['componentA', 'componentB', 'componentC'];
        const status = await checkComponentStatus(components);

        const allComponentsReady = Object.values(status).every(comp => comp.ok !== false);
        if (!allComponentsReady) {
            return Response.json({ error: 'Not all components are ready', status }, { status: 503 });
        }

        // Proceed with task execution...
    }

    try {
        await executeWithStatusCheck();
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});