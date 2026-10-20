import { Review } from '../models/Review.js';
import Joi from 'joi';

const createSchema = Joi.object({
  mealCode: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  reviewedBy: Joi.string().hex().length(24).optional(),
});

// GET /api/reviews
// TODO: implement per README.md section 2.
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ reviews });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
// TODO: implement per README.md section 2.
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({message: 'Review not found'});
    }
    res.status(200).json({ review });
  } catch (err) { next(err); }
}

// POST /api/reviews
// TODO: implement per README.md section 2.
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, {abortEarly: false,stripUnknown: true});
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    const review = await Review.create(value);
    res.status(201).json({ review });
  } catch (err) { next(err); }
}

// GET /api/reviews/summary?mealCode=ML101
// TODO: implement per README.md section 3.
export async function getReviewSummary(req, res, next) {
  try {
    const { mealCode } = req.query;
    if (!mealCode) {
      return res.status(400).json({
        message: 'mealCode is required',
      });
    }
    const reviews = await Review.find({ mealCode }).lean();
    const reviewCount = reviews.length;
    const averageRating = reviewCount? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount: null;
    res.status(200).json({
      summary: {mealCode,reviewCount,averageRating,},
    });
  } catch (err) { next(err); }
}


export async function getPopularMeals(req, res, next) {
  try {
    const minReviews =
      req.query.minReviews === undefined? 2: Number(req.query.minReviews);
    if (!Number.isInteger(minReviews) || minReviews <= 0) {
      return res.status(400).json({
        message: 'minReviews must be a positive integer',
      });
    }

    const popular = await Review.aggregate([
      {
        $group: {
          _id: '$mealCode',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
      {
        $match: {
          reviewCount: { $gte: minReviews },
        },
      },
      {
        $sort: {
          reviewCount: -1,
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          mealCode: '$_id',
          reviewCount: 1,
          averageRating: 1,
        },
      },
    ]);

    return res.status(200).json({ popular });
  } catch (err) {
    next(err);
  }
}
