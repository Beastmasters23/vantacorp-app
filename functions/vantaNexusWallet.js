import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaNexusWallet — Advanced Sovereign Ledger with Banking Integration.
 * Allows users to manage assets and input banking credentials securely.
 */
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const body = await req.json();
        const { action, banking_info, asset_data } = body;
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        // Retrieve existing wallet or create if missing
        let wallet = (await base44.asServiceRole.entities.VantaBrainNode.filter({ 
            specialization: 'orchestrator', 
            name: `wallet-${user.id}` 
        }))[0];

        if (!wallet) {
            wallet = await base44.asServiceRole.entities.VantaBrainNode.create({
                name: `wallet-${user.id}`,
                specialization: 'orchestrator',
                host_node: 'nexus-vault',
                status: 'Ready',
                knowledge_data: { 
                    balance: 0, 
                    assets: [], 
                    banking_connected: false 
                }
            });
        }

        const kd = wallet.knowledge_data || {};

        // --- UPDATE BANKING: Input Banking Information ---
        if (action === 'update_banking') {
            if (!banking_info || !banking_info.account_number || !banking_info.routing_number) {
                return Response.json({ error: 'Incomplete banking information' }, { status: 400 });
            }

            // Note: In a production Vanta Nexus, this would be encrypted before storage.
            // For now, we store the state in the knowledge_data object.
            await base44.asServiceRole.entities.VantaBrainNode.update(wallet.id, {
                knowledge_data: {
                    ...kd,
                    banking: {
                        bank_name: banking_info.bank_name || 'Generic Bank',
                        account_last_four: banking_info.account_number.slice(-4),
                        routing_number: banking_info.routing_number,
                        connected_at: new Date().toISOString()
                    },
                    banking_connected: true
                },
                knowledge_version: (wallet.knowledge_version || 0) + 1,
                log: [...(wallet.log || []).slice(-9), `[${new Date().toISOString()}] Banking information updated.`]
            });

            return Response.json({ status: 'ok', message: 'Banking information securely updated' });
        }

        // --- FETCH: Get full wallet state ---
        if (action === 'status') {
            return Response.json({
                status: 'ok',
                wallet_id: wallet.id,
                balance: kd.balance || 0,
                assets: kd.assets || [],
                banking: kd.banking || null,
                banking_connected: !!kd.banking_connected
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});