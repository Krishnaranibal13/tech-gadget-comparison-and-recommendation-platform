const gadgetImages = {
  // Smartphones
  1: "/images/galaxy-s25.jpg",
  2: "/images/iphone-16.jpg",
  3: "/images/iphone-16.jpg",
  4: "/images/oneplus-13.jpg",
  5: "/images/oneplus-13.jpg",
  6: "/images/pixel-9.jpg",

  // Laptops
  8: "/images/inspiron-14.jpg",
  9: "/images/pavilion-14.jpg",
  10: "/images/ideopad-slim-5.png",

  // Earphones
  11: "/images/wf-c700n.jpg",
  12: "/images/oneplus-buds-3.jpg",
  13: "/images/jbl-tune-buds.jpg",

  // Smartwatches
  14: "/images/apple-watch-series-10.png",
  15: "/images/galaxy-watch7.webp",
  16: "/images/oneplus-watch-2.jpg",
};

function getGadgetImage(gadget) {
  if (!gadget || !gadget.id) {
    return "/images/tech-products.jpg";
  }

  return (
    gadgetImages[gadget.id] ||
    "/images/tech-products.jpg"
  );
}

export default getGadgetImage;