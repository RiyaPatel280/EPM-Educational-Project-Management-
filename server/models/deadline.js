import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Deadline name/title is required"],
      trim: true,
      maxlength: [
        1000,
        "Feedback meassage cannot be more than 1000 characters",
      ],
    },

    dueDate: {
      type: Date,
      ref: "User",
      required: [true, "Due Date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created By is required"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: true,
  },
);

//Indexing for better query performance
deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ project: 1 });
deadlineSchema.index({ createdBy: 1 });



export const Deadline =
  mongoose.models.Deadline || mongoose.model("deadline", deadlineSchema);
