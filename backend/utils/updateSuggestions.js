
import { getSuggestionsModel } from "./db.manager.js";

export const updateSuggestions = async (conn, type, values) => {
  try {
    if (!values || !type || !conn) return [];

    const SuggestionModel = await getSuggestionsModel(conn);

    let arr = [];

    // Normalize input → always array
    if (typeof values === "object" && values !== null && !Array.isArray(values)) {
      values = [values];
    }

    if (Array.isArray(values)) {
      arr = values;
    } else if (typeof values === "string") {
      try {
        const parsed = JSON.parse(values);
        arr = Array.isArray(parsed) ? parsed : [values];
      } catch {
        arr = [values];
      }
    }

    // Normalize each item → STRING VALUE
    const normalizeItem = (v) => {
      if (typeof v === "string") return v.trim();

      if (typeof v === "object" && v !== null) {
        if (v.label?.trim()) return v.label.trim();
        if (v.value?.trim()) return v.value.trim();
        if (v.type?.trim()) return v.type.trim();
      }

      return "";
    };

    arr = arr
      .map(normalizeItem)
      .filter((v) => typeof v === "string" && v.length > 0);

    if (!arr.length) return [];

    // type REMOVE DUPLICATES (important)
    arr = [...new Set(arr)];

    // type FIND EXISTING BY type + value
    const existingDocs = await SuggestionModel.find({
      type,
      value: { $in: arr },
    }).lean();

    const existingMap = new Map(
      existingDocs.map((doc) => [doc.value, doc._id])
    );

    // type NEW VALUES (only those not in DB)
    const newValues = arr
      .filter((val) => !existingMap.has(val))
      .map((val) => ({
        type, // type IMPORTANT FIX
        value: val,
      }));

    let newDocs = [];

    if (newValues.length) {
      newDocs = await SuggestionModel.insertMany(newValues);
    }

    // Merge all IDs
    const allDocs = [...existingDocs, ...newDocs];

    return allDocs.map((d) => d._id);
  } catch (err) {
    console.error("Suggestion update error:", err);
    return [];
  }
};