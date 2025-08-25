
  document.addEventListener("DOMContentLoaded", function () {
   
    mapboxgl.accessToken = mapToken;
    console.log("Mapbox Token:", mapboxgl.accessToken);
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center:listing.geometry.coordinates,
      zoom: 9,
    }); 
  
    const marker= new mapboxgl.Marker({color:"red"})  // This creates a blue default marker
  .setLngLat(listing.geometry.coordinates)
  .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking </p>`)
    )
  .addTo(map);
  });




