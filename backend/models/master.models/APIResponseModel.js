import mongoose from "mongoose";
export const apiResponceSchema = new mongoose.Schema(
  {
    agent: String,
    adminuser: String,
    Type: String,
    hangupcause: String,
    startTime: mongoose.Schema.Types.Mixed,
    hanguptime: mongoose.Schema.Types.Mixed,
  },
  { strict: false, collection: "APIresponce" }
);
let APIresponce = null;

export const getAPIResponceModel = () => {
  if (!APIresponce) {
    const crmsDb = mongoose.connection.useDb("crms");
    try {
      APIresponce = crmsDb.model("APIresponce");
    } catch (error) {
      APIresponce = crmsDb.model("APIresponce", apiResponceSchema);
    }
  }
  return APIresponce;
};

export default getAPIResponceModel;
