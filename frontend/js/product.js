document.addEventListener("DOMContentLoaded", async () => {

const container = document.getElementById("productDetails");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

try{

const res = await fetch("/api/products");
const products = await res.json();

const product = products.find(p => p._id === id);

if(!product){
container.innerHTML = "<p>Product not found</p>";
return;
}

container.innerHTML = `
<div class="col-md-6 mb-4 mb-md-0">
<img src="${product.image}" class="product-details-image" alt="${product.name}">
</div>

<div class="col-md-6">
<div class="product-details-content">

<h2>${product.name}</h2>

<p>${product.description}</p>

<h4>$${product.price}</h4>

<button class="btn btn-primary align-self-start" id="addCart">
Add to Cart
</button>

</div>
</div>
`;

document.getElementById("addCart").addEventListener("click", () => {

let cart = JSON.parse(localStorage.getItem("cart")) || [];

cart.push({
name: product.name,
price: product.price,
image: product.image
});

localStorage.setItem("cart", JSON.stringify(cart));

alert("Added to cart");

});

}catch(err){

console.error(err);
container.innerHTML = "<p class='text-danger'>Failed to load product</p>";

}

});
