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
      name: "customer",
      type: "list",
      message: "Would you like to [VIEW] products or [BUY] with item ID?",
      choices: ["VIEW", "BUY", "EXIT"]
    })
    .then(function(answer) {
      // based on their answer, either call the VIEW or BUY functions
      if (answer.customer === "VIEW") {
        readProducts();
      } else if (answer.customer === "BUY") {
        buyProduct();
      } else {
        connection.end();
      }
    });
}

  

function buyProduct() {
  // query the database for all items being sold
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to buy
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
          message: "Input the product ID of the item you want to buy?"
        },
        {
          name: "quantity",
          type: "input",
          message: "How much would you like buy?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_id === answer.choice) {
            chosenItem = results[i];
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
              console.log("Order placed successfully!");
              start();
              
            }
          );
        } else {
          // not enough product, so apologize and start over
          console.log("Not enough product! Please select a lower quantity or wait for more to arrive");
          start();
    
        }
      });
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