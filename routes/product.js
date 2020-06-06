const router = require('express').Router(),
  Product = require('../model/Product'),
  dotenv = require('dotenv'),
  verify = require('./verifyToken'),
  multer = require('multer'),
  cloudinary = require('cloudinary');

dotenv.config();

//---------------------------------------------------------------------
//Cloudinary config
cloudinary.config({
  cloud_name: 'ecommerce111',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Image Upload
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
    //console.log(req)
  }
});
// Check Image File
const imgFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only images are accepted!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imgFilter });
//----------------------------------------------------------------------




//GET ALL PRODUCTS
router.get('/all', verify, async (req, res) => {
  const products = await Product.find();
  res.send(products)
})
//GET SPECIFIC PRODUCT(ID)
router.get("/:id", async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found." });
  }
});

//DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  //Cloudinary image delete-------------
  const img_id = req.header('img_id');
  cloudinary.v2.api.delete_resources(img_id, (err) => {
    if (err) {
      req.json(err.message);
    }
  });
  //------------------------------------
  if (product) {
    await product.remove();
    res.send({ message: "Product Deleted" });
  } else {
    res.status(404).send({ message: "Error" });
  }
});

//ADD NEW PRODUCT
router.post("/create", verify, upload.single("image"), async (req, res) => {
  let item = JSON.parse(req.body.product);
  //Cloudinary images storage-------------
  cloudinary.v2.uploader.upload(req.file.path, async (err, result) => {
    if (err) {
      req.json(err.message);
    }
    item.image.img = result.secure_url;
    //add image's public_id to image object
    item.image.id = result.public_id;

    //------------------------------------
    const product = new Product({
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      brand: item.brand,
      category: item.category,
      stock: item.stock
    });
    const newProduct = await product.save();
    if (newProduct) {
      return res.status(201).send({ message: 'New Product Created', data: newProduct });
    }
    return res.status(500).send({ message: ' Error in Creating Product.' });
  })
})

//UPDATE PRODUCT
router.put("/:id", upload.single("image"), async (req, res) => {
  let update = JSON.parse(req.body.product);
  // Cloudinary images storage--------------
  if (req.file != null) {                       //Check if image is updated
    cloudinary.v2.uploader.upload(req.file.path, async (err, result) => {
      if (err) {
        req.json(err.message);
      }
      update.image.img = result.secure_url;
      //add image's public_id to image object
      update.image.id = result.public_id;
    })
  }else update.image=false;
  //---------------------------------------
  const product = await Product.findOne({ _id: update.id });
  if (product) {
    let newUpdate = {
      name: update.name,
      price: update.price,
      description: update.description,
      // image: update.image,
      brand: update.brand,
      category: update.category,
      stock: update.stock
    }
    update.image!=false?newUpdate.image=update.image:false //Update image if update exist

    const updatedProduct = await product.updateOne(newUpdate)
    if (updatedProduct) {
      return res.status(200).send({ message: 'Product Updated', data: updatedProduct });
    }
  }
  return res.status(500).send({ message: ' Error in Updating Product.' });

});

module.exports = router;