import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaNexusChat — Real-time streaming-ready chat gateway for Vanta Nexus.
 * Provides high-speed message retrieval and injection for the Live Chat UI.
 */
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const body = await req.json();
        const { action, message, limit = 50 } = body;
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        // --- FETCH: Get latest live messages ---
        if (action === 'sync') {
            const messages = await base44.asServiceRole.entities.DirectMessage.list('-created_date', limit);
            return Response.json({
                status: 'ok',
                messages: messages.map(m => ({
                    id: m.id,
                    sender: m.from_user_name,
                    content: m.content,
                    timestamp: m.created_date,
                    is_me: m.from_user_id === user.id
                })).reverse()
            });
        }

        // --- SEND: Inject message without 'prompt' overhead ---
        if (action === 'send') {
            if (!message) return Response.json({ error: 'Message required' }, { status: 400 });

            const newMsg = await base44.asServiceRole.entities.DirectMessage.create({
                from_user_id: user.id,
                from_user_name: user.full_name || user.email,
                to_user_id: 'vanta-system',
                to_user_name: 'Vanta Nexus',
                content: message,
                read: false
            });

            // Trigger Vanta's autonomous response asynchronously
            base44.asServiceRole.functions.invoke('vantaAGIGateway', {
                input: message,
                action: 'pipeline',
                verbose: false
            }).then(async (res) => {
                if (res.data?.response) {
                    await base44.asServiceRole.entities.DirectMessage.create({
                        from_user_id: 'vanta-system',
                        from_user_name: '🤖 Vanta Nexus',
                        to_user_id: user.id,
                        to_user_name: user.full_name || user.email,
                        content: res.data.response,
                        read: false
                    });
                }
            });

            return Response.json({ status: 'sent', message_id: newMsg.id });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});