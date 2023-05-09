const mongoose = require('mongoose')

const conn = "mongodb+srv://quyen:abc12345@cluster0.cycndqg.mongodb.net/auto_irrigation"
const connection = mongoose.connect(conn)

const dataSchema = mongoose.Schema({
    value: Number,
    time: String,
    name: String
})

const pumpSchema = mongoose.Schema({
    time: String,
    name: String,
    status: String
})

const HumidModel = mongoose.model("Humid", dataSchema)
const MoistModel = mongoose.model("Moist", dataSchema)
const TempModel = mongoose.model("Temp", dataSchema)
const PumpModel = mongoose.model("Pump", pumpSchema)

module.exports = {
    HumidModel,
    MoistModel,
    TempModel,
    PumpModel
}



