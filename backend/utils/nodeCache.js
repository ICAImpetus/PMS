import { LRUCache } from "lru-cache";

// 1. Hospital Tenant Cache (TTL: 30 mins)
export const hospitalCache = new LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 30
});

// 2. WhatsApp Account Credentials Cache (TTL: 30 mins)
export const waAccountCache = new LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 30
});

// 3. Workflow Nodes Cache (TTL: 15 mins)
export const nodeCache = new LRUCache({
    max: 5000,
    ttl: 1000 * 60 * 15
});

// 4. Doctor Profile & Timings Cache (TTL: 10 mins)
export const doctorCache = new LRUCache({
    max: 2000,
    ttl: 1000 * 60 * 10
});

// 5. Dynamic Dropdown Lists (Departments / Doctors list) (TTL: 5 mins)
export const dynamicOptionsCache = new LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 5
});

// ======================= HELPER METHODS ======================= //

/**
 * Cache-First Hospital Tenant Resolver
 */
export const getCachedHospital = async (HospitalModel, phoneNumberId) => {
    const cacheKey = `hospital:${phoneNumberId}`;
    if (hospitalCache.has(cacheKey)) {
        return hospitalCache.get(cacheKey);
    }
    const hospital = await HospitalModel.findOne({
        whatsAppPhoneNumberId: phoneNumberId,
        isDeleted: false
    }).lean();

    if (hospital) hospitalCache.set(cacheKey, hospital);
    return hospital;
};

/**
 * Cache-First WhatsApp Account Credentials Resolver
 */
export const getCachedWAAccount = async (WAAccountModel, hospitalId, phoneNumberId) => {
    const cacheKey = `waAccount:${hospitalId.toString()}:${phoneNumberId}`;
    if (waAccountCache.has(cacheKey)) {
        return waAccountCache.get(cacheKey);
    }
    const waAccount = await WAAccountModel.findOne({
        hospitalId,
        phoneNumberId,
        isConnected: true
    }).lean();

    if (waAccount) waAccountCache.set(cacheKey, waAccount);
    return waAccount;
};

/**
 * Cache-First Doctor Details Resolver
 */
export const getCachedDoctor = async (DoctorModel, docId) => {
    const cacheKey = `doc:${docId.toString()}`;
    if (doctorCache.has(cacheKey)) {
        return doctorCache.get(cacheKey);
    }
    const doc = await DoctorModel.findById(docId).lean();
    if (doc) doctorCache.set(cacheKey, doc);
    return doc;
};

/**
 * Cache-First Workflow Node Resolver
 */
export const getCachedNode = async (NodeModel, hospitalId, nodeId) => {
    const cacheKey = `node:${hospitalId.toString()}:${nodeId}`;
    if (nodeCache.has(cacheKey)) {
        return nodeCache.get(cacheKey);
    }
    const nodeDoc = await NodeModel.findOne({ hospitalId, nodeId }).lean();
    if (nodeDoc) nodeCache.set(cacheKey, nodeDoc);
    return nodeDoc;
};

/**
 * High-speed single-pass template interpolator (O(N) replacement)
 * Loops se bachta hai aur direct regex replacement karta hai
 */
export const interpolateTemplate = (template = "", context) => {
    if (!template || !context) return template;

    const ctx = context instanceof Map ? Object.fromEntries(context) : context;
    return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
        return ctx[key] !== undefined && ctx[key] !== null ? String(ctx[key]) : "";
    });
};

/**
 * Cache Invalidation (Admin update hone par call karein)
 */
export const invalidateHospitalCache = (hospitalId) => {
    const hid = hospitalId.toString();
    for (const key of nodeCache.keys()) {
        if (key.includes(hid)) nodeCache.delete(key);
    }
    for (const key of dynamicOptionsCache.keys()) {
        if (key.includes(hid)) dynamicOptionsCache.delete(key);
    }
    for (const key of waAccountCache.keys()) {
        if (key.includes(hid)) waAccountCache.delete(key);
    }
};