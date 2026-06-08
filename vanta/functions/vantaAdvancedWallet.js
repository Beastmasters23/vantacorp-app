import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaAdvancedWallet — Sovereign Ledger v2.0
 * 
 * ARCHITECTURE: INDEPENDENT POWER PROTOCOL (IPP)
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides high-security multi-currency asset management.
 * 
 * FEATURES:
 * - Multi-Currency: USD, BTC, ETH, GOLD, SILVER
 * - Cold Storage: High-latency 'vault' accounts for protection
 * - AES-256 Simulation: Encrypted transaction metadata
 * - IPP Variants: Standard (A), High-Privacy (B), Audit-Ready (C)
 */

const CURRENCY_MODIFIERS = {
    USD: 1,
    BTC: 65000,
    ETH: 3500,
    GOLD: 2300,
    SILVER: 30
};

const WALLET_VARIANTS = {
    original: (tx) => tx,
    B_privacy: (tx) => ({ ...tx, description: '[REDACTED]', metadata: { ...tx.metadata, encrypted: true } }),
    C_audit: (tx) => ({ ...tx, metadata: { ...tx.metadata, audit_trail: true, ip: 'nexus_core' } })
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { action, variant = 'original' } = body;

        // --- ACTION: INITIALIZE VAULT ---
        if (action === 'init_vault') {
            const vaultId = `vault_${Date.now()}`;
            const vault = await base44.asServiceRole.entities.VantaBankAccount.create({
                account_id: vaultId,
                account_name: 'Vanta Sovereign Vault',
                account_type: 'vault',
                currency: 'USD',
                balance: 0,
                available_balance: 0,
                status: 'active',
                owner_id: user.id,
                tags: ['cold-storage', 'nexus-v2']
            });
            return Response.json({ ok: true, vault });
        }

        // --- ACTION: DEPOSIT ASSET ---
        if (action === 'deposit_asset') {
            const { account_id, amount, currency = 'USD', description = 'Asset Deposit' } = body;
            const accounts = await base44.asServiceRole.entities.VantaBankAccount.filter({ account_id });
            if (!accounts.length) return Response.json({ error: 'Account not found' }, { status: 404 });

            const account = accounts[0];
            const valueUsd = amount * (CURRENCY_MODIFIERS[currency] || 1);

            const tx = {
                tx_id: `tx_adv_${Date.now()}`,
                to_account_id: account_id,
                amount: valueUsd,
                currency: 'USD',
                tx_type: 'deposit',
                description: `${description} (${amount} ${currency})`,
                metadata: { original_amount: amount, original_currency: currency },
                timestamp: new Date().toISOString()
            };

            const transform = WALLET_VARIANTS[variant] || WALLET_VARIANTS.original;
            const secureTx = transform(tx);

            await Promise.all([
                base44.asServiceRole.entities.VantaBankAccount.update(account.id, {
                    balance: account.balance + valueUsd,
                    available_balance: account.available_balance + valueUsd
                }),
                base44.asServiceRole.entities.VantaBankTransaction.create(secureTx)
            ]);

            return Response.json({ ok: true, tx_id: secureTx.tx_id, new_balance_usd: account.balance + valueUsd });
        }

        // --- ACTION: GET WALLET STATE ---
        if (action === 'get_state') {
            const accounts = await base44.asServiceRole.entities.VantaBankAccount.filter({ owner_id: user.id });
            const txs = await base44.asServiceRole.entities.VantaBankTransaction.list('-timestamp', 10);
            
            return Response.json({
                ok: true,
                total_value_usd: accounts.reduce((s, a) => s + a.balance, 0),
                accounts: accounts.map(a => ({ name: a.account_name, type: a.account_type, balance: a.balance, currency: a.currency })),
                recent_activity: txs.map(t => ({ id: t.id, type: t.tx_type, amount: t.amount, desc: t.description }))
            });
        }

        return Response.json({ error: 'Unknown action' }, { status: 400 });

    } catch (error) {
        console.error('[vantaAdvancedWallet] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
