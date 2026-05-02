import mongoose from "mongoose";

export const toObjectId = (id) => {

    if (!id) return null;

    // already ObjectId
    if (id instanceof mongoose.Types.ObjectId) return id;

    // string → ObjectId
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
        return new mongoose.Types.ObjectId(id);
    }

    // object with _id
    if (id?._id) {
        return toObjectId(id._id);
    }

    return null;
};