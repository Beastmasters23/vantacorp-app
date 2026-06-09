import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const directives = await base44.getPendingDirectives();
        for (const directive of directives) {
            let requiredFiles = await base44.getRequiredFiles(directive);
            if (!requiredFiles) {
                await base44.logError(directive, 'Required files not found');
                continue;
            }
            let protocol = await base44.checkProtocolAvailability(directive);
            if (!protocol) {
                await base44.logError(directive, 'Protocol not found');
                continue;
            }
            // Proceed with the task execution (mocked)
            await base44.executeDirective(directive);
        }
        return Response.json({ status: 'checked directives successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});