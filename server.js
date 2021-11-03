const express = require("express");
const fs = require('fs');
const app = express();
const formidable = require('formidable');
const path = require("path");
const hbs = require('express-handlebars');
const uploadDir = __dirname + '/static/upload/';
const PORT = process.env.PORT || 8000;
let FILES = []
let ID = 1;

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static("static"));
app.use(express.urlencoded({
  extended: true
}));

app.get("/upload", (req, res) => {
  res.render('upload.hbs', {});
})
app.post("/upload", (req, res) => {
  let form = formidable({});
  form.uploadDir = uploadDir;
  form.keepExtensions = true
  form.multiples = true
  form.parse(req, (_, fields, files) => {
    console.log(files)
    if (Array.isArray(files.upl)) {
      for (const f of files.upl) {
        const file = {}
        file.id = ID++;
        file.img = getFileImg(f.type)
        file.name = f.name;
        file.size = f.size
        file.type = f.type
        file.path = f.path
        file.date = f.lastModifiedDate.getTime()
        FILES.push(file)
      }
    } else {
      const file = {}
      file.id = ID++;
      file.img = getFileImg(files.upl.type)
      file.name = files.upl.name;
      file.size = files.upl.size
      file.type = files.upl.type
      file.path = files.upl.path
      file.date = files.upl.lastModifiedDate.getTime()
      FILES.push(file)
    }
    res.redirect("/upload")
  });
})
app.get("/filemanager", (req, res) => {
  res.render('filemanager.hbs', { FILES });
})
app.get("/delete", (req, res) => {
  FILES = FILES.filter(f => f.id != req.query.id)
  res.redirect("/filemanager")
})
app.get("/remove-all", (req, res) => {
  FILES = [];
  res.redirect("/filemanager")
})
app.get("/info", (req, res) => {
  res.render('info.hbs', FILES.find(f => f.id == req.query.id));
})
app.get("/download", (req, res) => {
  res.sendFile(FILES.find(f => f.id == req.query.id).path)
})

function getFileImg(type) {
  if (type.includes("json"))
    return "/json.svg";
  if (type.includes("text"))
    return "/text.svg";
  if (type.includes("image"))
    return "/image.svg";

  return "/default.svg"
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
})
