import axios from "axios";
import mongo from "../db.js";

function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const fetchAndStoreSamwadData = async () => {
  try {
    console.log("Background Sync: Starting data sync from Samwad API...");
    const collectionName = "APIresponce";

    const tokenRes = await axios.post("https://samwad.iotcom.io/api/applogin", {
      username: "srkh",
      password: "RahulSR@789",
    });

    const token = tokenRes.data?.token;

    if (!token) {
      console.error("Background Sync Error: Token not received from Samwad API.");
      return;
    }
    console.log("Background Sync: Samwad API token fetched successfully.");

    const today = new Date();
    const endDate = getFormattedDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const startDate = getFormattedDate(yesterday);

    console.log(
      `Background Sync: Fetching data for dates ${startDate} to ${endDate}.`
    );

    const dataRes = await axios.post(
      "https://samwad.iotcom.io/callData",
      {
        startdate: startDate,
        enddate: endDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = dataRes.data?.result;
    if (!Array.isArray(data) || data.length === 0) {
      console.log("Background Sync: No data records fetched from Samwad API.");
      return;
    }
    console.log(`Background Sync: ${data.length} records fetched from Samwad API.`);

    const apiChannelIDs = data
      .map((item) => item.channelID)
      .filter((id) => id);

    if (apiChannelIDs.length === 0) {
      console.log(
        "Background Sync Complete: No records with a channelID found in API response."
      );
      return;
    }

    const existingDocs = await mongo.findMulti(
      { channelID: { $in: apiChannelIDs } },
      collectionName
    );

    const existingChannelIDs = new Set(existingDocs?.map((doc) => doc.channelID));

    const recordsToInsert = [];
    for (const item of data) {
      if (item.channelID && !existingChannelIDs.has(item.channelID)) {
        recordsToInsert.push(item);
      }
    }

    if (recordsToInsert.length > 0) {
      await mongo.insertMulti(recordsToInsert, collectionName);
      console.log(
        `Background Sync Complete: ${recordsToInsert.length} new records inserted into ${collectionName}.`
      );
    } else {
      console.log(
        `Background Sync Complete: No new records found in ${collectionName}. Database is up-to-date.`
      );
    }
  } catch (error) {
    const errorMessage = error.response
      ? JSON.stringify(error.response.data)
      : error.message;
    console.error("❌ Background Sync Error:", errorMessage, error.stack);
  }
};

export default fetchAndStoreSamwadData;

