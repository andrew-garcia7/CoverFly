import mongoose, { Schema } from "mongoose";
const MoneySchema = new Schema({ currency: { type: String, required: true }, amountPaise: { type: Number, required: true } }, { _id: false });
const LatLngSchema = new Schema({ lat: Number, lng: Number }, { _id: false });
const RideSchema = new Schema({
    riderUserId: { type: String, required: true, index: true },
    driverUserId: { type: String, required: false, index: true },
    status: {
        type: String,
        required: true,
        enum: [
            "REQUESTED",
            "MATCHING",
            "ASSIGNED",
            "DRIVER_ARRIVING",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED"
        ],
        index: true
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ["BIKE", "MINI", "SUV", "LUXURY", "ELECTRIC"],
        index: true
    },
    pickup: {
        address: { type: String, required: true },
        location: { type: LatLngSchema, required: true }
    },
    dropoff: {
        address: { type: String, required: true },
        location: { type: LatLngSchema, required: true }
    },
    pricing: {
        baseFare: { type: MoneySchema, required: true },
        distanceFare: { type: MoneySchema, required: true },
        timeFare: { type: MoneySchema, required: true },
        surgeMultiplier: { type: Number, required: true },
        platformFee: { type: MoneySchema, required: true },
        taxes: { type: MoneySchema, required: true },
        discount: { type: MoneySchema, required: true },
        total: { type: MoneySchema, required: true },
        estimatedDistanceKm: { type: Number, required: true },
        estimatedDurationMin: { type: Number, required: true },
        ecoSuggestion: {
            suggestedVehicle: { type: String, required: false },
            co2SavedGramsEstimate: { type: Number, required: false }
        }
    },
    payment: {
        method: { type: String, required: true, enum: ["CASH", "UPI", "CARD"] },
        split: {
            enabled: { type: Boolean, required: false },
            participants: { type: Array, required: false }
        }
    },
    safety: {
        shareLinkToken: { type: String, required: false, index: true },
        isSafetyModeOn: { type: Boolean, required: true, default: false }
    }
}, { timestamps: true });
RideSchema.index({ status: 1, createdAt: -1 });
export const RideModel = mongoose.model("Ride", RideSchema);
