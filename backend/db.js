import { MongoClient, ObjectId } from "mongodb"; // Import ObjectId
import dotenv from 'dotenv';
dotenv.config();
const url = `${process.env.MONGO_URL}/`;
import { generateUniqueId } from "./src/utils.js";
// Removed mongoose import as it's not used in this file's functions

async function insertOne(obj, coll) {
  const uri = url;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(process.env.database);
    const collection = database.collection(coll);

    const result = await collection.insertOne(obj);
    console.log(result.acknowledged, " document inserted");
  } catch (e) {
    console.error("Error inserting document:", e);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

async function insertMulti(obj, coll) {
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const dtmfdetials = database.collection(coll);
    const result = await dtmfdetials.insertMany(obj);
    console.log(result.insertedCount + " documents inserted");
  } catch (e) {
    console.log("catch block in instertMulti");
    console.error(e);
  } finally {
    console.log("finally called closing insertMulti connection");
    await client.close();
  }
}

async function updateMulti(filter, coll, updateDoc) {
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const collections = database.collection(coll);
    // Convert _id string to ObjectId if it exists in the filter
    if (filter._id && typeof filter._id === 'string') {
      filter._id = new ObjectId(filter._id);
    }
    const result = await collections.updateOne(filter, updateDoc);
    console.log("result in updateMulti function", result);
    return result; // Return the result
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

// *** CORRECTED FUNCTION ***
// Added 'options = {}' to accept parameters like { upsert: true }
async function updateDocument(filter, coll, updateDoc, options = {}) {
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const collections = database.collection(coll);

    // Convert _id string to ObjectId if it exists in the filter
    if (filter._id && typeof filter._id === 'string') {
      filter._id = new ObjectId(filter._id);
    }

    // Pass the 'options' object to the native updateOne method
    const result = await collections.updateOne(filter, updateDoc, options);

    console.log("updateOne Result:", result); // Added for debugging
    return result; // Return the result object
  } catch (e) {
    console.error("Error in updateDocument:", e);
    return { error: e.message }; // Return error object in case of failure
  } finally {
    await client.close();
  }
}

// *** CORRECTED FUNCTION ***
// Removed the hardcoded 'projection' from the original file
// This is necessary for the duplicate check (needs 'channelID'/'bridgeID')
async function findMulti(qurobj, coll, options = {}) { // Added options parameter
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const dtmfdetials = database.collection(coll);
    
    // Convert _id string to ObjectId if it exists in the query object
    if (qurobj._id && typeof qurobj._id === 'string') {
        qurobj._id = new ObjectId(qurobj._id);
    }
    
    const query = qurobj;

    // Apply options like sort, skip, limit if provided
    let result = dtmfdetials.find(query);
    
    if (options.sort) {
      result = result.sort(options.sort);
    }
    if (options.skip) {
      result = result.skip(options.skip);
    }
    if (options.limit) {
      result = result.limit(options.limit);
    }

    const datavalues = await result.toArray();
    return datavalues;
  } catch (e) {
    console.error("Error in findMulti:", e);
  } finally {
    console.log("finally called closing findMulti connection");
    await client.close();
  }
}

// *** ADDED FUNCTION (Was missing but used in index.js) ***
async function countDocuments(filter, coll) {
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const collection = database.collection(coll);
    const count = await collection.countDocuments(filter);
    return count;
  } catch (e) {
    console.error("Error in countDocuments:", e);
  } finally {
    await client.close();
  }
}

// *** ADDED FUNCTION (Was missing but used in index.js) ***
async function deleteOne(filter, coll) {
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const collection = database.collection(coll);
     // Convert _id string to ObjectId if it exists in the filter
     if (filter._id && typeof filter._id === 'string') {
      filter._id = new ObjectId(filter._id);
    }
    const result = await collection.deleteOne(filter);
    return result;
  } catch (e) {
    console.error("Error in deleteOne:", e);
  } finally {
    await client.close();
  }
}


async function findAllData(qurobj, coll) {
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const dtmfdetials = database.collection(coll);
    const queryAlways = { isDeleted: { $ne: true } };
    const query = qurobj;

    // Find all matching documents without projection
    const result = dtmfdetials
      .find({ ...query, ...queryAlways })
      .project({ _id: 0, password: 0 });
    //console.log("list of  documents inserted");
    const datavalues = await result.toArray();
    return datavalues;
  } catch (e) {
    console.error(e);
  } finally {
    console.log("finally called closing findAllData connection");
    await client.close();
  }
}

async function findAllDataWithProjection(queryObj, projectionObj, coll) {
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const dbCollection = database.collection(coll);
    const query = { isDeleted: { $ne: true } };
    // Only include fields explicitly mentioned in projectionObj
    const result = dbCollection
      .find({ ...queryObj, ...query })
      .project(projectionObj);
    const dataValues = await result.toArray();
    return dataValues;
  } catch (e) {
    console.error(e);
  } finally {
    console.log("finally called closing findAllDataWithProjection connection");
    await client.close();
  }
}

async function findSingleProjectedArrayField(
  queryObj,
  arrayKey,
  fieldsToKeep,
  coll
) {
  const uri = url;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.database);
    const collection = db.collection(coll);

    // Prepare projection pipeline
    const projection = {
      [arrayKey]: {
        $map: {
          input: `$${arrayKey}`,
          as: "item",
          in: fieldsToKeep.reduce((acc, key) => {
            acc[key] = `$$item.${key}`;
            return acc;
          }, {}),
        },
      },
    };

    const result = await collection
      .aggregate([
        { $match: queryObj },
        { $project: projection },
        { $limit: 1 },
      ])
      .toArray();

    return result[0] || null;
  } catch (e) {
    console.error(e);
  } finally {
    console.log("finally called: closing MongoDB connection");
    await client.close();
  }
}

async function findMultiwithLimit(qurobj, coll, lmt) {
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const dtmfdetials = database.collection(coll);
    //const query = {"camp":"test"};
    const query = qurobj;
    const options = {
      // sort returned documents in ascending order by filename (A->Z)
      //sort: { filename:1 },
      // Include only the `title` and `imdb` fields in each returned document
      projection: { _id: 0, study: 1 },
    };
    const result = dtmfdetials.find(query, options).limit(lmt);
    //console.log("list of  documents inserted");
    const datavalues = await result.toArray();
    return datavalues;
  } catch (e) {
    console.error(e);
  } finally {
    console.log("finally called closing findMultiwithLimit connection");
    await client.close();
  }
}

async function deleteMulti(qurobj, coll) {
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const collection = database.collection(coll);
    //const query = {"camp":"test"};
    const query = qurobj;
    const deleteAck = await collection.deleteMany(query);
    console.log("delete operation ack");
    console.log(deleteAck);
  } catch (e) {
    console.error(e);
  } finally {
    console.log("finally called closing connection after delete operation ");
    await client.close();
  }
}

async function finddoc(collectionName, filter) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const database = client.db(`${process.env.database}`);
    const collection = database.collection(collectionName);
    // console.log('collection is :', collection)
    console.log("filter is :", filter);
    
    // Convert _id string to ObjectId if it exists in the filter
    if (filter._id && typeof filter._id === 'string') {
        filter._id = new ObjectId(filter._id);
    }
    
    const foundDocument = await collection.findOne(filter);

    if (foundDocument) {
      return foundDocument;
    } else {
      return "not found";
    }
  } catch (err) {
    console.error("=== DATABASE ERROR DETAILS ===");
    console.error("Function: finddoc");
    console.error("Collection:", collectionName);
    console.error("Filter:", JSON.stringify(filter));
    console.error("MongoDB URL:", url);
    console.error("Database:", process.env.database);
    console.error("Error Type:", err.name);
    console.error("Error Message:", err.message);
    console.error("Error Stack:", err.stack);
    console.error("=== END ERROR DETAILS ===");
    throw err;
  } finally {
    await client.close();
    console.log("finally called findOne connection");
  }
}

async function updateBranchInHospital(
  dbName,
  collectionName,
  hospitalId,
  updatedBranch
) {
  const uri = url;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const hospital = await collection.findOne({ ID: hospitalId });
    if (!hospital) {
      return { success: false, status: 404, message: "Hospital not found" };
    }

    const index = hospital.branches.findIndex(
      (branch) => branch.ID === updatedBranch.ID
    );
    if (index === -1) {
      return { success: false, status: 404, message: "Branch not found" };
    }

    hospital.branches[index] = updatedBranch;

    const result = await collection.updateOne(
      { ID: hospitalId },
      { $set: { branches: hospital.branches } }
    );

    if (result.modifiedCount === 1) {
      return {
        success: true,
        status: 200,
        message: "Branch updated successfully",
        data: updatedBranch,
      };
    } else {
      return {
        success: false,
        status: 500,
        message: "Branch update failed", // Removed stray 'M'
      };
    }
  } catch (error) {
    console.error("Error updating branch:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
      error: error.message,
    };
  } finally {
    await client.close();
  }
}

async function addBranchToHospital(
  dbName,
  collectionName,
  hospitalId,
  newBranch
) {
  const uri = url;
  const client = new MongoClient(uri);
  newBranch.ID = generateUniqueId();

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const hospital = await collection.findOne({ ID: hospitalId });
    if (!hospital) {
      return { success: false, status: 404, message: "Hospital not found" };
    }

    hospital.branches.push(newBranch);

    const result = await collection.updateOne(
      { ID: hospitalId },
      { $set: { branches: hospital.branches } }
    );

    if (result.modifiedCount === 1) {
      return {
        success: true,
        status: 200,
        message: "Branch added successfully",
        data: newBranch,
      };
    } else {
      return {
        success: false,
        status: 500,
        message: "Branch addition failed", // Removed stray 'Message'
      };
    }
  } catch (error) {
    console.error("Error adding branch:", error);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
      error: error.message,
    };
  } finally {
    await client.close();
  }
}

const findBranchById = async (hospitalId, branchId, collection, dbName) => {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    const hospitals = db.collection(collection);

    // Use aggregation to filter branches directly in the DB
    const result = await hospitals
      .aggregate([
        {
          $match: { ID: hospitalId },
        },
        {
          $project: {
            branches: {
              $filter: {
                input: "$branches",
                as: "branch",
                cond: { $eq: ["$$branch.ID", branchId] },
              },
            },
          },
        },
      ])
      .toArray();

    if (!result.length || result[0].branches.length === 0) {
      throw new Error("Branch not found in hospital");
    }
    // console.log('result in findBranchById is:', result[0].branches);
    // Return the first (and only) matching branch
    return result[0].branches[0];
  } catch (error) {
    console.error("Error fetching branch:", error.message);
    throw error;
  } finally {
    await client.close();
  }
};

/**
 * Mark one branch inside a hospital as deleted.
 *
 * • dbName, collectionName – where the hospitals live
 * • hospitalId  – value of the hospital’s ID field (string | ObjectId)
 * • branchId    – value of the branch’s ID field   (string | ObjectId)
 *
 * Returns a result object similar to your pattern.
 */
async function softDeleteBranchInHospital(
  dbName,
  collectionName,
  hospitalId,
  branchId
) {
  const client = new MongoClient(url); // or hard‑code uri

  try {
    await client.connect();
    const col = client.db(dbName).collection(collectionName);

    const hId =
      typeof hospitalId === "string" ? hospitalId : hospitalId.toString();
    const bId = typeof branchId === "string" ? branchId : branchId.toString();

    const result = await col.updateOne(
      { ID: hId }, // locate the hospital
      {
        $set: {
          "branches.$[b].isDeleted": true,
          "branches.$[b].deletedAt": new Date(),
        },
      },
      {
        arrayFilters: [{ "b.ID": bId }], // locate the branch
        upsert: false,
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, status: 404, message: "Hospital not found" };
    }
    if (result.modifiedCount === 0) {
      return { success: false, status: 404, message: "Branch not found" };
    }

    return {
      success: true,
      status: 200,
      message: "Branch soft‑deleted",
      data: { branchId: bId, isDeleted: true },
    };
  } catch (err) {
    console.error("Error soft‑deleting branch:", err);
    return {
      success: false,
      status: 500,
      message: "Internal server error",
      error: err.message,
    };
  } finally {
    await client.close(); // ← ALWAYS close the client here
  }
}

/**
 * Read hospital documents with every nested array stripped of items
 * where isDeleted === true (soft‑deleted).
 *
 * ──────────────────────────────────────────────────────────────
 * @param {Object}   queryObj         Extra $match predicates (e.g. {_id})
 * @param {Object}   projectionObj   Normal MongoDB projection ({} = all)
 * @param {String}   coll             Collection name (default: "hospitals")
 * @param {String}   flag             Soft‑delete field (default: "isDeleted")
 * @returns {Promise<Array>}         Cleaned documents
 */
async function findActiveHospitalData(
  queryObj = {},
  projectionObj = {},
  coll = "hospitals",
  flag = "isDeleted"
) {
  const uri = process.env.MONGO_URI || url; // your “url” var still works
  const dbNm = process.env.database; // e.g. "mydb"
  const client = new MongoClient(uri);

  /** helper for $filter cond: value !== true */
  const neTrue = (path) => ({ $ne: [path, true] });

  /** build the aggregation pipeline once */
  const pipeline = [
    // 1️⃣ hospital itself must not be deleted + caller’s query
    { $match: { ...queryObj, [flag]: { $ne: true } } },

    // 2️⃣ rebuild branches, each with its own nested clean‑up
    {
      $addFields: {
        branches: {
          $map: {
            input: {
              $filter: {
                input: "$branches",
                as: "branch",
                cond: neTrue("$$branch." + flag),
              },
            },
            as: "branch",
            in: {
              $mergeObjects: [
                "$$branch",
                {
                  doctors: {
                    $filter: {
                      input: "$$branch.doctors",
                      as: "doc",
                      cond: neTrue("$$doc." + flag),
                    },
                  },
                  departments: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$$branch.departments",
                          as: "dept",
                          cond: neTrue("$$dept." + flag),
                        },
                      },
                      as: "dept",
                      in: {
                        $mergeObjects: [
                          "$$dept",
                          {
                            doctors: {
                              $filter: {
                                input: "$$dept.doctors",
                                as: "d2",
                                cond: neTrue("$$d2." + flag),
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  empanelmentList: {
                    $filter: {
                      input: "$$branch.empanelmentList",
                      as: "emp",
                      cond: neTrue("$$emp." + flag),
                    },
                  },
                  testLabs: {
                    $filter: {
                      input: "$$branch.testLabs",
                      as: "lab",
                      cond: neTrue("$$lab." + flag),
                    },
                  },
                  codeAnnouncements: {
                    $filter: {
                      input: "$$branch.codeAnnouncements",
                      as: "ca",
                      cond: neTrue("$$ca." + flag),
                    },
                  },
                  procedureList: {
                    $filter: {
                      input: "$$branch.procedureList",
                      as: "proc",
                      cond: neTrue("$$proc." + flag),
                    },
                  },
                  departmentIncharge: {
                    $filter: {
                      input: "$$branch.departmentIncharge",
                      as: "inc",
                      // *** THIS IS THE CORRECTED LINE (removed stray 'f') ***
                      cond: neTrue("$$inc." + flag), 
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  ];

  // 3️⃣ apply projection only if caller asked for one
  if (projectionObj && Object.keys(projectionObj).length) {
    pipeline.push({ $project: projectionObj });
  }

  try {
    await client.connect();
    const db = client.db(dbNm);
    const col = db.collection(coll);

    const data = await col.aggregate(pipeline).toArray();
    // console.log("findActiveHospitalData data:", data);
    return data;
  } catch (err) {
    console.error("findActiveHospitalData error:", err);
    throw err; // let caller handle it
  } finally {
    console.log("Closing Mongo connection (findActiveHospitalData)");
    await client.close();
  }
}

const findDoctorsAndDepartmentsByBranch = async (
  hospitalTrimmedName,
  branchId,
  coll,
  dbNm
) => {
  const pipeline = [
    {
      $match: {
        trimmedName: hospitalTrimmedName,
        "branches.ID": branchId,
        isDeleted: { $ne: true },
      },
    },
    {
      $unwind: "$branches",
    },
    {
      $match: {
        "branches.ID": branchId,
      },
    },
    {
      $project: {
        _id: 0,
        "branches.doctors": {
          $map: {
            input: "$branches.doctors",
            as: "doc",
            in: {
              id: "$$doc.id",
              name: "$$doc.name",
            },
          },
        },
        "branches.departments": 1, // You can further project departments if needed
      },
    },
  ];
  const uri = url;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbNm);
    const col = db.collection(coll);

    const data = await col.aggregate(pipeline).toArray();
    const doctors = data[0]?.branches?.doctors || [];
    const departments = data[0]?.branches?.departments || [];
    const object = {
      doctors,
      departments
    };

    // console.log("findActiveHospitalData data:", data);
    return object;
  } catch (err) {
    console.error("findActiveHospitalData error:", err);
    throw err; // let caller handle it
  } finally {
    console.log("Closing Mongo connection (findActiveHospitalData)");
    await client.close();
  }
};

const db = {
  insertOne,
  insertMulti,
  updateMulti,
  updateDocument,
  findMulti,
  findMultiwithLimit,
  finddoc,
  deleteMulti,
  deleteOne, // Added deleteOne
  countDocuments, // Added countDocuments
  updateBranchInHospital,
  addBranchToHospital,
  findBranchById,
  softDeleteBranchInHospital,
  findActiveHospitalData,
  findDoctorsAndDepartmentsByBranch,
  findAllData,
  findAllDataWithProjection,
  findSingleProjectedArrayField,
};

export default db;

export {
  insertOne,
  insertMulti,
  updateMulti,
  updateDocument,
  findMulti,
  findMultiwithLimit,
  finddoc,
  deleteMulti,
  deleteOne, // Added deleteOne
  countDocuments, // Added countDocuments
  updateBranchInHospital,
  addBranchToHospital,
  findBranchById,
  softDeleteBranchInHospital,
  findActiveHospitalData,
  findDoctorsAndDepartmentsByBranch,
  findAllData,
  findAllDataWithProjection,
  findSingleProjectedArrayField,
};

