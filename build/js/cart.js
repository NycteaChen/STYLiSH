import cartAmount from "./cartAmount.js";
const loading = document.querySelector(".loading");
const root = document.querySelector(".root");
const main = document.querySelector("main");
const form = document.querySelector(".personalForm");
const cartTotal = document.querySelector("#cart-total");
const purchaseSum = document.querySelector("#purchaseSum");
const totalSum = document.querySelector("#totalSum");
const cardPay = document.querySelector(".cardPay");
const freight = 60;
const purchaseArray = JSON.parse(localStorage.getItem("cart"));

cartAmount();
//顯示商品
const showPurchaseList = () => {
  loading.style.display = "none";
  
  let purchaseDetails = "";
  let sum = 0;
  purchaseArray.forEach((e) => {
    const { image, name, id, size, qty, stock, price } = e;
    const color = e.color.name;
    let quantityScroll = "";
    let subtotal;
    for (let i = 1; i < +stock + 1; i++) {
      if (i == qty) {
        quantityScroll += `<option value="${i}" selected >${i}</option>`;
        subtotal = i * +e.price;
        sum += subtotal;
      } else {
        quantityScroll += `<option value="${i}">${i}</option>`;
      }
    }

    purchaseDetails += `
          <div class="purchaseDetails">
            <div class="purchaseCard">
              <img
                src="${image}"
                style="width: 114px"
                alt="${name} ${size}"
              />
              <div class="purchaseData">
                <div class="purchaseName">${name}</div>
                <div class="purchaseId">${id}</div>
                <div class="purchaseColor">
                  <div class="variant">顏色</div>
                  <div class="color">${color}</div>
                </div>
                <div class="purchaseSize">
                  <div class="variant">尺寸</div>
                  <div class="size">${size}</div>
                </div>
              </div>
            </div>
            <div class="purchaseCount">
              <div class="count quantity">
                <div id="quantity">數量</div>
                <select id="selectNumber">
                  ${quantityScroll}
                </select>
              </div>
              <div class="count price">
                <div id="price">單價</div>
                <div >NT.<span id="perPrice">${price}</span></div>
              </div>
              <div class="count amount">
                <div id="amount">小計</div>
                <div>NT.<span  id="subtotal">${subtotal}<span></div>
              </div>
              <div class="delete"></div>
            </div>
          </div>
    `;
  });
  root.innerHTML = `
    <div class="cartTitle">購物車(${purchaseArray.length})</div>
    <div class="purchaseList">
      ${purchaseDetails} 
    </div>
 
  `;
  
  form.style.display = "block";
  purchaseSum.textContent = `${sum}`;
  totalSum.textContent = `${sum + freight}`;
  changeCost();
  removePurchase();
  creditCard();
};

//更改數量、金額
function changeCost() {
  const qtyValue = document.querySelectorAll("#selectNumber");
  const price = document.querySelectorAll("#perPrice");
  const subtotal = document.querySelectorAll("#subtotal");
  let newpurchaseSum = 0;
  qtyValue.forEach((e, index) => {
    e.addEventListener("change", () => {
      const newSum = +e.value * +price[index].textContent;
      subtotal[index].textContent = `${newSum}`;
      subtotal.forEach((e) => {
        newpurchaseSum += +e.textContent;
      });
      purchaseSum.textContent = `${newpurchaseSum}`;
      totalSum.textContent = `${newpurchaseSum + freight}`;
      newpurchaseSum = 0;

      //移除商品時，其他商品更改的select value不會因重整改變
      purchaseArray[index].qty = e.value;
      localStorage.setItem("cart", JSON.stringify(purchaseArray));
    });
  });
}

//信用卡付款欄隱藏、顯現
const creditCard = () => {
  const payMethod = document.querySelectorAll("#payMethod");
  payMethod.forEach((e) => {
    e.addEventListener("change", () => {
      if (e.value === "credit_card") {
        cardPay.className = "cardPay cardPay-in";
      } else {
        cardPay.className = "cardPay";
      }
    });
  });
};

//移除商品
const removePurchase = () => {
  const remove = document.querySelectorAll(".delete");
  remove.forEach((e, index) => {
    e.addEventListener("click", () => {
      alert("已從購物車移除！");
      purchaseArray.splice(index, 1);
      cartTotal.textContent = `${purchaseArray.length}`;
      if (purchaseArray.length === 0) {
        main.innerHTML = `<h1 class="nothing">購物車沒有物品喔！</h1>`;
        localStorage.removeItem("cart");
      } else {
        localStorage.setItem("cart", JSON.stringify(purchaseArray));
        showPurchaseList();
      }
    });
  });
};

setTimeout(showPurchaseList, 500);
