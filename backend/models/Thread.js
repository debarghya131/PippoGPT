import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["system", "user", "assistant"],
        required: true,
    },
    content: {
        type: String,
        required: true,
        maxlength: 10000,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },

});

const ThreadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true,
        unique: true,
        maxlength: 128,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        default: "New Thread",
        maxlength: 60,
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

ThreadSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model("Thread", ThreadSchema);
