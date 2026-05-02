// const mongo = require("./db.js");
import mongo from './db.js'


const functionToUpdateDb = async () => { 
    await mongo.updateMulti()
}