export default function cartAmount() {
  const cartTotal = document.querySelector("#cart-total");
  const main = document.querySelector("main");
  if (!localStorage.getItem("cart")) {
    cartTotal.textContent = "0";
    if (location.pathname.includes("cart.html")) {
      const loading = document.querySelector(".loading");
      setTimeout(() => {
        loading.style.display = "none";
        main.innerHTML = `<h1 class="nothing">購物車沒有物品喔！</h1>`;
      }, 500);
    }
  } else {
    cartTotal.textContent = `${
      JSON.parse(localStorage.getItem("cart")).length
    }`;
  }
}

cartAmount();
