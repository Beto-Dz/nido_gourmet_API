const { Schema, model } = require("mongoose");

const scheduleSchema = new Schema({
  startTime: { type: String, required: true }, // Format: HH:mm
  endTime: { type: String, required: true }, // Format: HH:mm
});

const floodgateSchema = new Schema({
  monday: scheduleSchema,
  tuesday: scheduleSchema,
  wednesday: scheduleSchema,
  thursday: scheduleSchema,
  friday: scheduleSchema,
  saturday: scheduleSchema,
  sunday: scheduleSchema,
  visits: [{ type: Date }], // Stores timestamps of visits
});

const feederSchema = new Schema({
  isActive: {
    // Changed from "active" to "isActive"
    type: Boolean,
    required: true,
  },
  batteryLevel: {
    type: Number,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  floodgates: {
    1: floodgateSchema,
    2: floodgateSchema,
    // 3: floodgateSchema,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

feederSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model("feeder", feederSchema);
