const express=require("express");
router = express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review=require("../model/review.js");
const Listing=require("../model/listing.js");
const {validateReview, isLoggedIn, isreviewAuthor}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");

//review 
//post review route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview)
);

//delete review Route
router.delete("/:reviewId",isLoggedIn,isreviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;