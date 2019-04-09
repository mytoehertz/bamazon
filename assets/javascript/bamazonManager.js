var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});

// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt({
      name: "manager",
      type: "list",
      message: "What would you like to do today?",
      choices: ["VIEW PRODUCTS", "VIEW INVENTORY", "ADD PRODUCT", "EXIT"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.manager === "VIEW PRODUCTS") {
        readProduct();
      } else if (answer.manager === "VIEW INVENTORY") {
        viewInventory();
      } 

      else if (answer.manager === "ADD PRODUCT") {
        addProduct();
      } else {
        connection.end();
      }
    });
}
function viewInventory() {
    // query the database for all items being sold
    connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
      // once you have the items, prompt the user for which they'd like to see
      inquirer
        .prompt([
          {
            name: "choice",
            type: "rawlist",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].item_id);
              }
              return choiceArray;
            },
            message: "Input the product ID of the item you want to see"
          },
          {
            name: "quantity",
            type: "input",
            message: "Enter correct inventory?"
          }
        ])
        .then(function(answer) {
          // get the information of the chosen item
          var chosenItem;
          for (var i = 0; i < results.length; i++) {
            if (results[i].item_id === answer.choice) {
              chosenItem = results[i];
              connection.query("SELECT * FROM products WHERE ?", 
              {
                item_id: chosenItem
              },
              function(err, res) {
                if (err) throw err;
            
                // Log all results of the SELECT statement
            
                console.log(res);
            
                // connection.end();
              });
            }
          }
  
          // determine if there is enough product
          if (chosenItem.stock_qty < parseInt(answer.quantity)) {
              var updatedQty = answers.quantity - chosentItem.stock_qty
            // qty high enough, so update db, let the user know, and start over
            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_qty: updatedQty
                },
                {
                  item_id: chosenItem.id
                }
              ],
              function(error) {
                if (error) throw err;
                console.log("Updated successfully!");
                start();
                
              }
            );
          } else {
            console.log("There was an error");
            start();
      
          }
        });
    });
  }


// function to handle posting new items into products table
function addProduct() {
  // this is the request prompt
  inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "What is the item you would like to submit?"
      },
      {
        name: "department",
        type: "input",
        message: "What department would you like to place your item in?"
      },
      {
        name: "price",
        type: "input",
        message: "What is the price of the item?"
      },
      {
        name: "quantity",
        type: "input",
        message: "What would you like your starting quantity to be?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      // when finished prompting, insert a new item into the db with that info
      connection.query(
        "INSERT INTO products SET ?",
        {
          item_name: answer.item,
          department_name: answer.department,
          price: answer.price,
          stock_qty: answer.quantity || 0
        },
        function(err) {
          if (err) throw err;
          console.log("Your new product was created successfully!");
          readProducts();
          start();
        }
      );
    });
}


function readProducts() {
    console.log("Selecting all products...\n");
  
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
  
      // Log all results of the SELECT statement
  
      console.log(res);
  
      // connection.end();
    });
  }