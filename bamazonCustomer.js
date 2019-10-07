var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection 
var connection = mysql.createConnection({
    host: "localhost",

    // Port; if not 3306
    port: 3306,

    // Username
    user: "root",

    // Password
    password: "PPass1215!",
    database: "bamazon"
});

// connect to database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function 
    showProducts();
});




//function for current products
function showProducts() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        var userPickArray = [];
        for (var i = 0; i < results.length; i++) {
            userPickArray.push({
                id: results[i].item_id,
                name: results[i].product_name,
                department: results[i].department_name,
                price: results[i].price,
                stock: results[i].stock_quantity
            })
        }
        for (var i =0;i<userPickArray.length;i++){
             console.log(userPickArray[i].id, userPickArray[i].name, userPickArray[i].price)
            
           };
        selectProduct();

    })
}

//function to ask the user to select product by id 
function selectProduct() {

    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        inquirer
            .prompt([{
                    name: "choice",
                    type: "input",
                    message: "Please enter the id of the product you would like to buy",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return "Please enter a valid id number from the table above";
                    }
                },
                {
                    name: "buy",
                    type: "input",
                    message: "How many units would you like to buy?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return "Please enter the number of units you would like to purchase";
                    }
                }
            ])


            // function for the answers provided by user
            .then(function (answer) {
                var answerId = answer.choice;

                var query = "SELECT product_name,price,stock_quantity FROM products WHERE ?";
                connection.query(query, { item_id: answerId }, function (err, res) {
                    if (err) throw err;
                    for (var i = 0; i < res.length; i++) {
                    var currentStock = res[i].stock_quantity 
                    if (currentStock> answer.buy){
                        var newStock = currentStock-answer.buy;
                        connection.query("UPDATE products SET ? WHERE ?",
                        [{
                           stock_quantity:newStock
                        },{
                            item_id:answerId
                        }])
                        console.log("Congratulations! You bought "+ answer.buy + " " +  res[i].product_name + "s for " + res[i].price + " dollars each for a total of " + Math.floor((answer.buy * res[i].price)) + " dollars.")
                        showProducts();
                    }
                    else{
                        console.log("I'm sorry there are not enough available in stock for your request. Please try again.")
                        showProducts();
                    }
                 
                }
                })
            })
    })
}



