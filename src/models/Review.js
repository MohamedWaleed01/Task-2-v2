import mongoose from 'mongoose';

// TODO: define the Review schema per README.md section 1.

const reviewSchema = new mongoose.Schema(
  {
    mealCode: { type: String, required: true },
    rating : { type: Number, required: true, min:1, max: 5 },
    comment: { type: String},
    reviewedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  },
  { timestamps: true } , { mealCode: 1, reviewedBy: 1 }
);

export const Review = mongoose.model('Review', reviewSchema);
