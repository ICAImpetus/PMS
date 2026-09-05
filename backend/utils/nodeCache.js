import { LRUCache } from "lru-cache";

// Cache config: Holds max 5000 nodes in memory for 10 minutes
const nodeCache = new LRUCache({
    max: 5000,
    ttl: 1000 * 60 * 10 // 10 minutes
});

// Cache compiled regular expression patterns to minimize CPU overhead in high-throughput loops
// Stores max 1,000 regex objects in memory
const regexCache = new LRUCache({ max: 1000 });

/**
 * Helper to interpolate dynamic variables in string template: {{key}} -> value
 */
export const interpolateTemplate = (template = "", context) => {
    if (!template || !context) return template;

    const entries = context instanceof Map ? Array.from(context.entries()) : Object.entries(context);
    let result = template;

    for (const [key, val] of entries) {
        if (!key) continue;

        let pattern = regexCache.get(key);
        if (!pattern) {
            // Escape special regex characters in keys before pattern compilation
            const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            pattern = new RegExp(`{{${escapedKey}}}`, "g");
            regexCache.set(key, pattern);
        }

        result = result.replace(pattern, val != null ? String(val) : "");
    }

    return result;
}

/**
 * Fetch a Node document using Cache-First pattern
 */
export const getCachedNode = async (NodeModel, hospitalId, nodeId) => {
    const cacheKey = `node:${hospitalId.toString()}:${nodeId}`;

    // 1. Check in-memory cache first (0ms latency)
    if (nodeCache.has(cacheKey)) {
        return nodeCache.get(cacheKey);
    }

    // 2. Fallback to MongoDB lookup if cache missed
    const nodeDoc = await NodeModel.findOne({ hospitalId, nodeId }).lean();

    // 3. Save to cache for subsequent requests
    if (nodeDoc) {
        nodeCache.set(cacheKey, nodeDoc);
    }

    return nodeDoc;
};

/**
 * Clear cache when Admin updates nodes via saveHospitalNodes API
 */
export const invalidateHospitalNodeCache = (hospitalId) => {
    for (const key of nodeCache.keys()) {
        if (key.startsWith(`node:${hospitalId.toString()}`)) {
            nodeCache.delete(key);
        }
    }
};