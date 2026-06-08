
// Locate the lines where orchestrator nodes are filtered:
// ORIGINAL: const orchestrators = brainNodes.filter(n => n.specialization === 'orchestrator' && n.status !== 'Offline');
// CHANGE TO:
const orchestrators = brainNodes.filter(n => (n.specialization === 'orchestrator' || n.cognitive_domain === 'orchestrator') && n.status !== 'Offline');
