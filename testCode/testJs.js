//**********************************************************************
// UBC - CPEN400A
// Arthor: Juan Luis Flores, Xi He
// File: "js/app.js"
//**********************************************************************

//**********************************************************************
// Assignment 2
//**********************************************************************
// Assignment 2: Task 1
// Define a constructor function with the signature function Store
// Assignment 2: Task 1-A
// The constructor function should initialize the following properties:
var Store = function (serverUrl) {
  this.stock = {};
  this.cart = {};
  this.onUpdate = null;
  this.serverUrl = serverUrl;
}

// Assignment 2: Task 2
// Create a global variable named products
// assign it an associative array (i.e. an object) that will store information about the products.
// var products = {};

// Assignment 2: Task 3
// Assignment 4: Task 1
// Assignment 5: Task 2
// var productUrl = "https://cpen400a-bookstore.herokuapp.com";
var productUrl = "http://localhost:3000";
var store = new Store(productUrl);
var displayed = [];

// Assignment 2: Task 1-B
// Define the following methods for Store (i.e. prototype functions)
// Assignment 2: Task 5
// Implement the following methods of Store:
Store.prototype.addItemToCart = function (itemName) {
  resetTimeout();
  try {
    if (this.stock[itemName]["quantity"] === 0 ||
      this.stock[itemName]["quantity"] === null
    ) {
      // window.alert("Sorry, the item '" + itemName + "' is running out in stock now.");
    } else if (!this.cart.hasOwnProperty(itemName)) {
      this.cart[itemName] = 1;
      this.stock[itemName]["quantity"] -= 1;
      console.log(this.cart);
      this.onUpdate(itemName);
    } else {
      this.cart[itemName] += 1;
      this.stock[itemName]["quantity"] -= 1;
      console.log(this.cart);
      this.onUpdate(itemName);
    }
  } catch (e) {
    console.log(e);
  }
}

Store.prototype.removeItemFromCart = function (itemName) {
  resetTimeout();
  try {
    if (this.cart[itemName] == 0 || !this.cart.hasOwnProperty(itemName)) {
      // window.alert(itemName + " is not in shopping cart.");
    } else if (this.cart[itemName] == 1) {
      this.cart[itemName] = 0;
      this.stock[itemName]["quantity"] += 1;
      console.log(this.cart);
      delete this.cart[itemName];
      this.onUpdate(itemName);
    } else {
      this.cart[itemName] -= 1;
      this.stock[itemName]["quantity"] += 1;
      console.log(this.cart);
      this.onUpdate(itemName);
    }
  } catch (e) {
    console.log(e);
  }
}

// Assignment 2: Task 6
// Invokes an alert to display the contents of the given cart object
// Re-write it in Assignment 3, Task 5
// Store.prototype.showCart = function () {
//   resetTimeout();
//   var container = document.getElementById('modal-content');
//   renderCart(container, store);
// }

// Assignment 2: Task 7
// Create a global variable named inactiveTime
// Use the global inactiveTime variable to keep track of how much time has elapsed.
var inactiveTime = 0;

var interval = setInterval(setIntervalMethod, 1000);
function setIntervalMethod() {
  inactiveTime += 1;
  // console.log("Time Counter: " + inactiveTime); // Check counter in console window
}

var timeout = setTimeout(setTimeoutMethod, 3000000);
function setTimeoutMethod() {
  // console.log("Inactivity time " + inactiveTime+ " seconds alert!");
  window.alert("Hey there! Are you still planning to buy something?");
  resetTimeout();
}

// Reset timeout counter after closing alert box and performing actions
function resetTimeout() {
  inactiveTime = 0;
  clearTimeout(timeout);
  // Call setTimeout() function recursively
  timeout = setTimeout(setTimeoutMethod, 3000000);
}

//**********************************************************************
// Assignment 3
//**********************************************************************
// Assignnment 3: Task 1
var renderProduct = function (container, storeInstance, itemName) {
  // Remove all child nodes
  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }

  // Create li element with class "product col-4"
  var liElem = document.createElement("li");
  // liElem.className = "product col-4";
  liElem.id = "product-" + itemName;
  // Create img elem with id and src
  var imgElem = document.createElement("img");
  imgElem.src = storeInstance["stock"][itemName].imageUrl;
  imgElem.id = "product";
  liElem.appendChild(imgElem);
  // Create div with .productDesc
  var divElem1 = document.createElement('div');
  divElem1.className = 'productDesc';
  liElem.appendChild(divElem1);
  // Create pricetag
  var h2priceElem = document.createElement('h2');
  h2priceElem.id = "priceTag";
  h2priceElem.innerHTML= storeInstance["stock"][itemName].price;
  divElem1.appendChild(h2priceElem);
  // Create prodname
  var nameElem = document.createElement('p');
  nameElem.innerHTML = storeInstance["stock"][itemName].label;
  divElem1.appendChild(nameElem);

  // Conditionally generate "Add to Cart" and "Remove from Cart" buttons:
  // Make sure that the click handlers on the buttons are working correctly.
  // If the quantity of an item in stock is zero, "Add to Cart" button should not be generated.
  if (storeInstance["stock"][itemName].quantity > 0) {
    var divAddElem = document.createElement('div');
    liElem.appendChild(divAddElem);
    var addToCart = document.createElement('button');
    // addToCart.id = "btn-add";
    addToCart.className = "btn-add";
    addToCart.innerHTML = "Add to Cart";
    addToCart.onclick = function() { storeInstance.addItemToCart(itemName) };
    divAddElem.appendChild(addToCart);
  }
  // If the quantity of an item in cart is zero, "Remove from Cart" button should not be generated.
  if (storeInstance["cart"][itemName] > 0) {
    var divRemoveElem = document.createElement('div');
    liElem.appendChild(divRemoveElem);
    var removeCart = document.createElement('button');
    // removeCart.id = "btn-remove";
    removeCart.className = "btn-remove";
    removeCart.innerHTML = "Remove from Cart";
    removeCart.onclick = function() { storeInstance.removeItemFromCart(itemName) };
    divRemoveElem.appendChild(removeCart);
  }

  container.appendChild(liElem);
}

var renderProductList = function(container, storeInstance) {
  // Remove all child nodes
  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }

  // Append productList to productView
  var productList = document.createElement('ul');
  productList.id = "productList";
  productList.className = "row justify-content-center productList";
  productList.style = "list-style-type:none";
  container.appendChild(productList);

  // Append list element to productList
  // var iname = Object.keys(storeInstance["stock"]);
  var iname = displayed;
  for (var i = 0; i < iname.length; i++) {
    // Add a div tag between <ul id="productList"> and <li>
    var liParent = document.createElement('div');
    liParent.className = "product col-4";
    productList.appendChild(liParent);
    var tname = iname[i];
    renderProduct(liParent, storeInstance, tname);
  }
}

// Assignnment 3: Task 2
var productView = document.getElementById("productView");
renderProductList(productView, store);

// Assignnment 3: Task 3
store.onUpdate = function (itemName) {
  try {
    var modalContent = document.getElementById('modal-content');
    var menuView = document.getElementById('menuView');
    if (itemName == null) {
      renderProductList(productView, store);
      renderCart(modalContent, store);
      renderMenu(menuView, store);
    } else {
      var prodID = 'product-' + itemName;
      var product = document.getElementById(prodID);
      renderCart(modalContent, store);
      renderProduct(product, store, itemName);
      renderMenu(menuView, store);
    }
  } catch (e) {
    console.log(e);
  }
}

// Assignnment 3: Task 4
var renderCartItem = function(container, storeInstance, itemName) {
  // Remove all child nodes
  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }

  // Table row including itemName and quantity
  var nItemName = document.createElement('th');
  nItemName.innerHTML = storeInstance["stock"][itemName].label; //itemName
  container.appendChild(nItemName);
  var nQty = document.createElement('th');
  nQty.innerHTML = storeInstance["cart"][itemName];
  container.appendChild(nQty);
  var price = document.createElement('th');
  price.innerHTML = storeInstance["stock"][itemName].price;
  container.appendChild(price);

  // Buttons invoking addItemToCart and removeItemFromCart
  if (storeInstance["stock"][itemName].quantity > 0) {
    var buttonAdd = document.createElement('button');
    buttonAdd.className = "btn-add-cart";
    buttonAdd.innerHTML = "+";
    buttonAdd.onclick = function() { storeInstance.addItemToCart(itemName) };
    nQty.appendChild(buttonAdd);
  }

  if (storeInstance["cart"][itemName] > 0) {
    var buttonSub = document.createElement('button');
    buttonSub.className = "btn-sub-cart";
    buttonSub.innerHTML = "-";
    buttonSub.onclick = function() { storeInstance.removeItemFromCart(itemName) };
    nQty.appendChild(buttonSub);
  }

  // Return the total price of the item
  var itemPrice = storeInstance["stock"][itemName].price * storeInstance["cart"][itemName];
  return itemPrice;
}

var renderCart = function(container, storeInstance){
  // Remove all child nodes
  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }
  // Append node "table" to node "container"
  var table = document.createElement('table');
  container.appendChild(table);
  // Append node "header of table" to node "table"
  var tableRow = document.createElement('tr');
  table.appendChild(tableRow);
  var itemName = document.createElement('th');
  itemName.innerHTML = "-------- Item -------- | ";
  tableRow.appendChild(itemName);
  var qty = document.createElement('th');
  qty.innerHTML = "-- Quantity -- | ";
  tableRow.appendChild(qty);
  var price = document.createElement('th');
  price.innerHTML = "-- Price --";
  tableRow.appendChild(price);
  // Append item's name and quantity (nTableRow) to node "table"
  var totalPrice = 0;
  for (var i = 0; i < Object.keys(storeInstance["cart"]).length; i++) {
    // Get item name
    var iname = Object.keys(storeInstance["cart"]);
    var tname = iname[i];
    // Use "nTableRow <tr>" as a container of each item record
    var nTableRow = document.createElement('tr');
    table.appendChild(nTableRow);
    itemPrice = renderCartItem(nTableRow, storeInstance, tname);
    totalPrice += itemPrice;
  }
  // Append totalPriceRow to node "table" (the cart table)
  var totalPriceRow = document.createElement('tr');
  table.appendChild(totalPriceRow);
  var separator = document.createElement('p');
  separator.innerHTML = "-----------------------";
  totalPriceRow.appendChild(separator);
  var totalPricehr = document.createElement('tr');
  totalPricehr.innerHTML = "Total Price: " + totalPrice + " CAD";
  totalPriceRow.appendChild(totalPricehr);
  // Append checkout button to node "table"
  var checkOutBtn = document.createElement('Button');
  checkOutBtn.id = 'btn-check-out';
  checkOutBtn.innerHTML = 'Check Out';
  checkOutBtn.onclick = function() {
    checkOutBtn.disabled = true;
    storeInstance.checkOut(function() {
      if (document.getElementById('btn-check-out'))
        document.getElementById('btn-check-out').disabled = false;
    });
  };
  container.appendChild(document.createElement('BR'));
  container.appendChild(checkOutBtn);
}

// Assignnment 3: Task 5
var modal = document.getElementById('modal');
var modalContent = document.getElementById('modal-content');
modalContent.innerHTML = "";

// Upgrade showCart() from Assignment 2, Task 6
var showCart = function () {
  while (modalContent.hasChildNodes()) {
    modalContent.removeChild(modalContent.firstChild);
  }
  renderCart(modalContent, store);
  modal.style.display = "block";
}

// Relevant display of the show cart
var hideCart = function () { modal.style.display = "none"; }
window.onclick = function(event) {
  if (event.target == modal) { modal.style.display = "none"; }
}
document.onkeydown = function(evt) {
  evt = evt || window.event;
  if (evt.keyCode == 27) {
      hideCart();
  }
};

//**********************************************************************
// Assignment 4
//**********************************************************************
// Task 2
var ajaxGet = function(url, onSuccess, onError, count) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  var retryRequest = function() {
    count += 1;
    if (count <= 3) {
      console.log("Total Errors: " + count)
      xhr.open("GET", url);
      // if (xhr.status == 200) {
      //   var response = JSON.parse(xhr.responseText);
      //   onSuccess(response);
      // }
      xhr.send(); // Send the request!
    }
    else {
      onError("Failed for " + count + " errors !");
    }
  }
  xhr.onload = function() {
    if (xhr.status == 200) {
      var response = JSON.parse(xhr.responseText);
      onSuccess(response);
    }
    else {
      console.log("Load Error");
      retryRequest();
    }
  };
  xhr.ontimeout = function() {
    console.log("Timeout Error");
    retryRequest();
  }
  xhr.onerror = function() {
    console.log("Status Error");
    retryRequest();
  }
  // Send message after all handlers are set up
  xhr.timeout = 2500;
  xhr.send();
}

// Task 3
var counter = 0;
Store.prototype.syncWithServer = function(onSync) {
  // this.onSync = onSync;
  // this.delta = {}
  var delta = {};
  var self = this;
  console.log("Old stock (this.stock)");
  console.log(this.stock);

  // Call the function ajaxGet(url, onSuccess, onError, count)
  ajaxGet(
    // "https://cpen400a-bookstore.herokuapp.com/products",
    self.serverUrl + "/products",
  	function(response) {
      console.log("Response");
      console.log(response);
      counter = 0; // Reset counter
      var iname = Object.keys(response);

      // Compute a "delta" object
      for (var i = 0; i < iname.length; i++) {
        var tname = iname[i];
        // The new product should show up in "delta" object!
        if (!self.stock.hasOwnProperty(tname)) {
          delta[tname] = {};
          delta[tname]["quantity"] = response[tname]["quantity"];
          delta[tname]["price"] = response[tname]["price"];
        }
        // Don't forget the quantity in the cart!
        else {
          if (!self.cart.hasOwnProperty(tname)) {
            var deltaQuantity = response[tname]["quantity"] - self.stock[tname]["quantity"];
          }
          else {
            var deltaQuantity = response[tname]["quantity"] - self.stock[tname]["quantity"] - self.cart[tname];
          }
          var deltaPrice = response[tname]["price"] - self.stock[tname]["price"];
          if (deltaQuantity != 0 || deltaPrice != 0) {
            delta[tname] = {};
            delta[tname]["quantity"] = deltaQuantity;
            delta[tname]["price"] = deltaPrice;
          }
        }
      }
      console.log("delta");
      console.log(delta);

      // Update stock property of Store
      for (var i = 0; i < iname.length; i++) {
        var tname = iname[i];
        if (!self.stock.hasOwnProperty(tname)) {
          self.stock[tname] = response[tname];
        }
        else {
          self.stock[tname]["price"] = response[tname]["price"];
          // If this item is not in cart
          if (!self.cart.hasOwnProperty(tname)) {
            self.stock[tname]["quantity"] = response[tname]["quantity"];
          }
          // If item quantity in response is 0, delete it in cart
          else if (response[tname]["quantity"] == 0) {
            self.stock[tname]["quantity"] = 0;
            delete self.cart[tname];
          }
          else if (response[tname]["quantity"] < self.cart[tname]) {
            self.stock[tname]["quantity"] = 0;
            self.cart[tname] = response[tname]["quantity"];
          }
          else {
            self.stock[tname]["quantity"] = response[tname]["quantity"] - self.cart[tname];
          }
        }
      }
      console.log("New stock (self.stock)");
      console.log(self.stock);
      console.log("New cart (self.cart)");
      console.log(self.cart);

      // To trigger re-rendering of the view
      self.onUpdate();
      // Call onSync argument if it was provided
      if (onSync) {
        onSync(delta);
      }
  	},
  	function(error) {
      console.log("Error");
      console.log(error);
      counter = 0; // Reset counter
  	},
    counter,
  ) // End ajaxGet
}
// Call it without argument to render the product box
// store.syncWithServer();

// Task 4
Store.prototype.checkOut = function (onFinish) {
  var self = this;

  // Invoke the syncWithServer method, passed with callback function
  this.syncWithServer(function(delta) {
    // Alert the user of the changes if delta is not empty
    if (Object.keys(delta).length != 0) {
      var delta_string = [];
      delta_string[0] = "Please focus on the changes of products!";
      for (var key in delta) {
        if (delta[key]["price"] != 0) {
          var oldPrice = self.stock[key]["price"] - delta[key]["price"];
          delta_string.push(key + ": price " + oldPrice + " -> " + self.stock[key]["price"]);
        }
        if (delta[key]["quantity"] != 0) {
          var oldQuantity = self.stock[key]["quantity"] - delta[key]["quantity"];
          delta_string.push(key + ": quantity " + oldQuantity + " -> " + self.stock[key]["quantity"]);
        }
      }
      window.alert(delta_string.join("\n"));
      console.log("Alert delta!");
    }
    // Alert the user the total amount due
    else if (Object.keys(self.cart).length != 0) {
      var totalPrice = 0;
      var iname = Object.keys(self.cart);
      for (var i = 0; i < iname.length; i++) {
        var tname = iname[i];
        var itemPrice = self.stock[tname]["price"] * self.cart[tname];
        totalPrice += itemPrice;
      }
      window.alert("Total amount due is: " + totalPrice + " CAD.");
      console.log("Alert total amount due!");
    }
    else {
      window.alert("Total amount due is: 0 CAD.");
      console.log("Alert NO amount due!");
    }
  });

  // Call onFinish argument if it was provided
  if (onFinish) {
    onFinish();
  }
}

//**********************************************************************
// Assignment 4
//**********************************************************************
// Task 2
store.syncWithServer(function(delta) {
  displayed = Object.keys(delta);
  renderProductList(productView, store);
});

// Copy two provided functions
Store.prototype.queryProducts = function(query, callback){
	var self = this;
	var queryString = Object.keys(query).reduce(function(acc, key){
			return acc + (query[key] ? ((acc ? '&':'') + key + '=' + query[key]) : '');
		}, '');
	ajaxGet(
    this.serverUrl+"/products?"+queryString,
		function(products){
			Object.keys(products)
				.forEach(function(itemName){
					var rem = products[itemName].quantity - (self.cart[itemName] || 0);
					if (rem >= 0){
						self.stock[itemName].quantity = rem;
					}
					else {
						self.stock[itemName].quantity = 0;
						self.cart[itemName] = products[itemName].quantity;
						if (self.cart[itemName] === 0) delete self.cart[itemName];
					}

					self.stock[itemName] = Object.assign(self.stock[itemName], {
						price: products[itemName].price,
						label: products[itemName].label,
						imageUrl: products[itemName].imageUrl
					});
				});
			self.onUpdate();
			callback(null, products);
		},
		function(error){
			callback(error);
		}
	)
}

function renderMenu(container, storeInstance){
	while (container.lastChild) container.removeChild(container.lastChild);
	if (!container._filters) {
		container._filters = {
			minPrice: null,
			maxPrice: null,
			category: ''
		};
		container._refresh = function(){
			storeInstance.queryProducts(container._filters, function(err, products){
					if (err){
						alert('Error occurred trying to query products');
						console.log(err);
					}
					else {
						displayed = Object.keys(products);
						renderProductList(document.getElementById('productView'), storeInstance);
					}
				});
		}
	}

	var box = document.createElement('div'); container.appendChild(box);
		box.id = 'price-filter';
		var input = document.createElement('input'); box.appendChild(input);
			input.type = 'number';
			input.value = container._filters.minPrice;
			input.min = 0;
			input.placeholder = 'Min Price';
			input.addEventListener('blur', function(event){
				container._filters.minPrice = event.target.value;
				container._refresh();
			});

		input = document.createElement('input'); box.appendChild(input);
			input.type = 'number';
			input.value = container._filters.maxPrice;
			input.min = 0;
			input.placeholder = 'Max Price';
			input.addEventListener('blur', function(event){
				container._filters.maxPrice = event.target.value;
				container._refresh();
			});

	var list = document.createElement('ul'); container.appendChild(list);
		list.id = 'menu';
		var listItem = document.createElement('li'); list.appendChild(listItem);
			listItem.className = 'menuItem' + (container._filters.category === '' ? ' active': '');
			listItem.appendChild(document.createTextNode('All Items'));
			listItem.addEventListener('click', function(event){
				container._filters.category = '';
				container._refresh()
			});
	var CATEGORIES = [ 'Clothing', 'Technology', 'Office', 'Outdoor' ];
	for (var i in CATEGORIES){
		var listItem = document.createElement('li'); list.appendChild(listItem);
			listItem.className = 'menuItem' + (container._filters.category === CATEGORIES[i] ? ' active': '');
			listItem.appendChild(document.createTextNode(CATEGORIES[i]));
			listItem.addEventListener('click', (function(i){
				return function(event){
					container._filters.category = CATEGORIES[i];
					container._refresh();
				}
			})(i));
	}
}
