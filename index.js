const express = require('express'),
      app = express(),
      path = require('path'),
      mongoose = require('mongoose'),
      dotenv = require('dotenv'),
      bodyParser = require('body-parser'),
      cors = require("cors"),
      { v4: uuidv4 } = require('uuid');



//Import Routes
const authRoute = require('./routes/auth'),
      productRoute = require('./routes/product');

dotenv.config();

//Connect to DB
mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, () => console.log('connected to DB')).catch((error) => console.log(error.reason));

//Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
//Static file(Frontend)
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
//Route Middleware
app.use('/api/user', authRoute);
app.use('/api/products', productRoute);
app.use('/api/product', productRoute);



const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server has started on port ${port}`);
});


