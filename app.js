const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to To-Do List."
});

const item2 = new Item({
  name : "Hit + to add items."
});

const item3 = new Item({
  name : "<-- Hit this to delete an Item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, (err) => {
        if(err){
          console.log(err);
        }
        else{
          console.log("SUCCESS");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.get("/:customList", (req, res) => {
  const customListName = req.params.customList;

  List.findOne({name : customListName}, (err, foundList) => {
    if(!err){
      if(!foundList){
        //create
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        
        list.save();
        res.redirect("/" + customListName)
      }
      else{
        //show
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });


});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name : itemName
  });

  item.save();
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;
  Item.findByIdAndRemove(checkedItem, (err) => {
    if(!err){
      console.log("SUCCESS");
      res.redirect("/");
    }
  });
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
