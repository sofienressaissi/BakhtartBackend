const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 8084
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require ('cors');
require("dotenv").config();
const app = express();

mongoose.connect('mongodb+srv://bakhtart:BakhtFash321%21@bakhtart1.yhqjy.mongodb.net',{
  useNewUrlParser : true,
  useUnifiedTopology: true,
}, (err)=> {
  if(err) throw err;
  console.log("Connected to BakhtArt Backend");
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});


app.use(express.json());
app.use(express.static(__dirname));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on PORT ${ PORT }`))

app.use("/fashion", require("./routes/fashionRouter"));
app.use("/adminbakht", require("./routes/adminBakhtRouter"));