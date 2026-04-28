import mongoose from "mongoose";
export async function connectMongo(uri) {
    mongoose.set("strictQuery", true);
    const maxDelayMs = 30_000;
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        attempt += 1;
        try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
            // eslint-disable-next-line no-console
            console.log("✅ MongoDB connected");
            return mongoose.connection;
        }
        catch (err) {
            const delay = Math.min(maxDelayMs, 1000 * Math.pow(1.6, attempt));
            // eslint-disable-next-line no-console
            console.error(`MongoDB connection error (attempt ${attempt}). Retrying in ${Math.round(delay)}ms`, err);
            await new Promise((r) => setTimeout(r, delay));
        }
    }
}
