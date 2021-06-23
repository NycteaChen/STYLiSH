import cartAmount from "./cartAmount.js";
const loading = document.querySelector(".loading");
const product = document.querySelector("#product");
let host_name = "https://api.appworks-school.tw/api/1.0";
let variants;
let variant;
let allProductData;

//從網址取得id
function getId() {
  let url = new URL(location.href);
  const id = url.searchParams.get("id");
  return id;
}

//用id取得商品資料
async function getProductData() {
  const id = getId();
  const productData = await fetch(
    `${host_name}/products/details?id=${id}`
  ).then((res) => res.json());
  const { data } = productData;
  return data;
}

//顯示商品資料
async function showProductData() {
  cartAmount();
  allProductData = await getProductData();
  variants = allProductData.variants;
  let {
    main_image,
    title,
    id,
    price,
    colors,
    sizes,
    note,
    texture,
    description,
    wash,
    place,
    story,
    images,
    category,
  } = allProductData;

  let colorDiv = "";
  let sizeDiv = "";
  let imageDiv = "";

  description = description.replace(/\r\n/g, "</br>");

  colors.forEach((color) => {
    let { code, name } = color;
    colorDiv += `
    <div 
      class="color"  
      title="${name}" 
      id = "${code}"
      style="background-color: #${code};"
    >
    </div>
    `;
  });

  sizes.forEach((size) => {
    sizeDiv += `
    <div class="size">${size}</div>
    `;
  });

  images.forEach((image, index) => {
    imageDiv += `
      <img class="product_images" src="${image}" alt="${title} sample ${
      index + 1
    }"/>
      `;
  });

  product.innerHTML = `
  <div class="product_details">  
    <img class="product_main-image" src='${main_image}' alt="${category} ${title}"/>
    <div class="product_data">
        <div class="product_title">${title}</div>
        <div class="product_id">${id}</div>
        <div class="product_price">TWD. ${price}</div>
        <div class="product_variants">
        <div class="product_variant">              
            <div class="variant_name">顏色</div>
            <div class="colors">
            ${colorDiv}
            </div>
        </div>
        <div class="product_variant">              
            <div class="variant_name">尺寸</div>
            <div class="sizes">
            ${sizeDiv}
            </div>
        </div>
        <div class="product_variant">              
            <div class="variant_name" id="amount">數量</div>
            <div class="product_amount">
            <button id="minus" class="minus operator"> - </button>
            <div class="product_number"></div>
            <button id="add" class="add operator"> + </button>
            </div>
        </div>
        </div>
        <button class="into_cart" type="submit">加入購物車</button>
        <div class="note">${note}</div>
        <div class="texture">${texture}</div>
        <div class="description">
        ${description}
        </div>
        <div class="wash">清潔：${wash}</div>
        <div class="place">產地：${place}</div>
    </div>
    </div>
    <div class="divide-line">
    <p>更多產品資訊</p>
    <hr>
    </div>
    <div class="product_introduction">
    <div class="product_story">
        ${story}
    </div>
    ${imageDiv}
    </div>
  `;
  loading.style.display = "none";

  getDefaultProductItem();
  selectActive();
  addToCart();
}

//篩選尚有庫存的商品，取得第一個顏色、最小尺寸設為預設品項
function getDefaultProductItem() {
  const firstItem = variants.find((e) => e.stock > 0);
  variant = {
    color_code: firstItem.color_code,
    size: firstItem.size,
    qty: 1,
  };

  const colors = document.querySelectorAll(".color");
  const sizes = document.querySelectorAll(".size");
  const amount = document.querySelector(".product_number");
  colors.forEach((color) => {
    if (color.id === variant.color_code) {
      color.className = "color color_active";
    }
  });
  sizes.forEach((size) => {
    if (size.textContent === variant.size) {
      size.className = "size size_active";
    } else if (getStock(variant.color_code, size.textContent) === 0) {
      size.className = "size sold_out";
    }
    amount.textContent = variant.qty;
  });
}

//商品品項選擇器
function selectActive() {
  const colors = document.querySelectorAll(".color");
  const sizes = document.querySelectorAll(".size");
  const operators = document.querySelectorAll(".operator");

  colors.forEach((color) => {
    color.addEventListener("click", colorSelector, false);
  });

  sizes.forEach((size) => {
    size.addEventListener("click", sizeSelector, false);
  });

  operators.forEach((operator) => {
    operator.addEventListener("click", calculator, false);
  });
}

//顏色選擇
function colorSelector(e) {
  const sizes = document.querySelectorAll(".size");
  const colors = document.querySelectorAll(".color");
  const size_active = document.querySelector(".size_active");
  const amount = document.querySelector(".product_number");
  colors.forEach((color) => (color.className = "color"));

  e.currentTarget.className = "color color_active";
  const color = e.currentTarget.getAttribute("id");

  const minSize = variants.find(
    (size) => size.color_code === color && size.stock > 0
  );

  sizes.forEach((size) => {
    if (getStock(color, size.textContent) === 0) {
      size.className = " size sold_out";
    } else {
      size.className = "size";
      size_active.className = "size size_active";
      if (getStock(color, size_active.textContent) === 0) {
        size_active.className = "size sold_out";
        if (size.textContent === minSize.size) {
          size.className = "size size_active";
        }
      }
    }
  });

  variant.qty = 1;
  amount.textContent = `${variant.qty}`;
}

//尺寸選擇
function sizeSelector(e) {
  const sizes = document.querySelectorAll(".size");
  const color = document.querySelector(".color_active");
  const amount = document.querySelector(".product_number");
  sizes.forEach((size) => {
    if (getStock(color.id, size.textContent) > 0) {
      size.className = "size";
    } else {
      size.classNmae = "size sold_out";
    }
  });
  e.currentTarget.className = "size size_active";

  variant.qty = 1;
  amount.textContent = `${variant.qty}`;
}

//數量選擇
function calculator(e) {
  const minus = document.querySelector("#minus");
  const add = document.querySelector("#add");
  const color = document.querySelector(".color_active");
  const size = document.querySelector(".size_active");
  const amount = document.querySelector(".product_number");
  let stock = getStock(color.id, size.textContent);
  if (e.currentTarget === add) {
    if (variant.qty < stock) {
      amount.textContent = `${(variant.qty += 1)}`;
    }
  } else if (e.currentTarget === minus) {
    if (variant.qty > 1) {
      amount.textContent = `${(variant.qty -= 1)}`;
    }
  }
}

// 商品品項庫存判定
function getStock(color, size) {
  let item = variants.find(
    (item) => item.color_code === color && item.size === size
  );
  return item.stock;
}

//加入購物車
function addToCart() {
  const intoCart = document.querySelector(".into_cart");
  const cartTotal = document.querySelector("#cart-total");

  let cartArray = [];

  intoCart.addEventListener("click", () => {
    alert(" 已加入購物車! ");
    const { id, title, price, main_image } = allProductData;
    const color = document.querySelector(".color_active");
    const size = document.querySelector(".size_active").textContent;
    const productStock = getStock(color.id, size);
    const newPurchase = {
      id: id,
      name: title,
      price: price,
      color: { code: color.id, name: color.getAttribute("title") },
      size: size,
      qty: variant.qty,
      image: main_image,
      stock: productStock,
    };

    if (!localStorage.getItem("cart")) {
      cartArray.push(newPurchase);
      localStorage.setItem("cart", JSON.stringify(cartArray));
    } else {
      cartArray = JSON.parse(localStorage.getItem("cart"));
      const sameItem = cartArray.filter(
        (item) =>
          item.id === newPurchase.id &&
          item.color.code === newPurchase.color.code &&
          item.size === newPurchase.size
      );

      if (sameItem == "") {
        cartArray.push(newPurchase);
        localStorage.setItem("cart", JSON.stringify(cartArray));
      } else {
        cartArray.map((item, index) => {
          if (
            item.id === newPurchase.id &&
            item.color.code === newPurchase.color.code &&
            item.size === newPurchase.size
          ) {
            cartArray.splice(index, 1, newPurchase);
            localStorage.setItem("cart", JSON.stringify(cartArray));
          }
        });
      }
    }
    cartTotal.textContent = `${cartArray.length}`;
  });
}

setTimeout(showProductData, 500);