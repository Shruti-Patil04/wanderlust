const Listing=require("../model/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingclient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm=(req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing=async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path:"reviews",
    populate:{
      path:"author"
    }
  }).populate("owner");
  if(!listing){
    req.flash("error","Listing you requested for Does not exists");
    return res.redirect("/listings");
  }
  console.log("Listing owner:", listing.owner);
  console.log("Listing geometry:", listing.geometry); 
  
  res.render("listings/show.ejs", { listing, currUser: req.user });

};

module.exports.createListing=async (req, res,next) => {
  let response=await geocodingclient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send()

    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
    let saveListing=await newListing.save();
    console.log(saveListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error","Listing you requested for Does not exists");
    res.redirect("/listings");
  }

  let originalImageUrl=listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    
    // 1. Find the listing first (instead of using findByIdAndUpdate)
    // We need the listing object to manually update geometry and save.
    let listing = await Listing.findById(id);

    // 2. Update the listing's basic properties
    listing.set({ ...req.body.listing });

    // 3. Geocode the new location (if the location/country/etc. was changed)
    // We access the potentially new location from req.body.listing
    let response = await geocodingclient.forwardGeocode({
        query: req.body.listing.location, // Assuming 'location' is the field that holds the address
        limit: 1,
    }).send();

    // 4. Update the geometry with the new coordinates
    // This is the CRITICAL missing step for coordinate updates!
    if (response && response.body.features && response.body.features.length) {
        listing.geometry = response.body.features[0].geometry;
    } else {
        // Optional: Handle case where geocoding fails (e.g., location is invalid)
        console.error("Geocoding failed for the updated location.");
    }
    
    // 5. Update the image if a new file was uploaded
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    // 6. Save all changes (including geometry and potentially image)
    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success"," Listing Deleted!");
  res.redirect("/listings");
};