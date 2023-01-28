const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const _=require("lodash");
const { name } = require("ejs");
// const date = require(__dirname + "/date.js");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');
try{mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");}
catch(e){
print(e);
};

const itemSchema={
    name:String
};

const listSchema={
    name:String,
    items:[itemSchema]
};
const Item=mongoose.model("Item",itemSchema);

const List=mongoose.model("List",listSchema);

const item1=new Item({
    name:"Enter new Item"
});
const item2=new Item({
    name:"Press on + to add"
});
const item3=new Item({
    name:"Mark check to remove"
});
const defaultitems=[item1,item2,item3];
let Name;

// try{Item.insertMany(defaultitems,function(err){
//     if(err)console.log(err);
//     else console.log("succesfully done!");
// })} catch(e){
//     print(e);
// };
// try {
//     Item.insertMany( defaultitems );
//  } catch (e) {
//     print (e);
//  };
// let workItems = [];
app.get("/", function (req, res) {  
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            try{Item.insertMany(defaultitems,function(err){
    if(err)console.log(err);
    else console.log("succesfully done!");
})} catch(e){
    print(e);
};
res.redirect("/");
        }
        else{
        res.render("list", {
            listTitle: "Today",
            items: foundItems
        });    }})
    })
app.get("/:name",function(req,res){
    var name=_.capitalize(req.params.name);
    
    List.findOne({name:name},function(err,foundList){
        if(!err){
            if(!foundList){
                const list=new List({
                    name:name,
                    items:defaultitems
                });
                list.save();
                res.redirect("/"+name);
            }
            else res.render("list",{listTitle:foundList.name,items:foundList.items})
        }
    })

    
})
app.post("/", function (req, res) {
    const item = req.body.item;
    const listName=req.body.list;
    const itemm=new Item({
        name:item
    });
    if(listName==="Today"){
        itemm.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName},function(err,foundList){
        foundList.items.push(itemm);
        foundList.save();
        res.redirect("/"+listName);
        })
    };
    
    // if (req.body.btn === "work") {
    //     workItems.push(itemm);
    //     res.redirect("/work");
    // }
    // else {
    //     defaultitems.push(itemm);
         
    // }
})

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    console.log("deleting"+" "+listName+" "+checkedItemId);
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,err=>{
           if(err) console.log(err);
           else console.log("successfully deleted the item");   
        });
        res.redirect("/");
    }
    else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
            res.redirect("/"+listName);
        }
        else console.log(err);
    })
    }
})
app.get("/work", function (req, res) {
    res.render("list", { listTitle: "work list", items: workItems })
})



app.listen(3000, function () {
    console.log("server running on port 3000");
})