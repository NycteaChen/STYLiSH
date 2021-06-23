import cartAmount from "./cartAmount.js";
const loading = document.querySelector(".loading");
let host_name = "https://api.appworks-school.tw/api/1.0";
let catalog = "all";
let nextPage = 0;
let keyword = "";
let symbol = "?";
let trigger = true;
let index = 0;
  

//獲取API資料
async function getIndexData() {
  const productData = await fetch(
    `${host_name}/products/${catalog}${keyword}${symbol}paging=${nextPage}`
  ).then((res) => res.json());
  const { data } = productData;
  nextPage = productData.next_paging;
  return { data, nextPage };
}

// 產品資訊清單
async function productList() {
  cartAmount();
  const allData = await getIndexData();
  const { data } = allData;
  const productList = document.querySelector(".products");
  nextPage = allData.nextPage;

  if (data.length > 0) {
    data.forEach((element) => {
      const {
        colors,
        title,
        price,
        main_image: mainImage,
        id,
        category,
      } = element;
      let productColor = "";
      colors.forEach((colors) => {
        const color = colors.code;
        productColor += `
          <div class="product_color" style="background-color:#${color}"></div>
        `;
      });

      productList.innerHTML += `
        <a class="product" href="product.html?id=${id}">
          <img src="${mainImage}" alt="${category} ${title}"/>
          <div class="product_colors">${productColor}</div>
          <div class="product_name">${title}</div>
          <div class="product_price">TWD.${price}</div>
        </a>
      `;
    });
  } else {
    productList.style.display = "block";
    productList.style.textAlign = "center";
    productList.innerHTML += `<h2>無相關產品資訊</h2>`;
  }
  loading.style.display = "none";
}

//show next page data
async function renderData() {
  setTimeout(() => {
    if (trigger) {
      if (nextPage) {
        loading.style.display = "block";
        setTimeout(productList, 500);
        trigger = false;
      }
    }
  }, 300);
}

//scroll event
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    renderData();
    loading.style.display = "none";
    trigger = true;
  }
});

//取得網址參數
function getTag() {
  let url = new URL(location.href);
  const tag = url.searchParams.get("tag");
  return tag;
}

function catalogPage() {
  slideCarousel();
  catalog = getTag();
  if (catalog === null) {
    catalog = "all";
    productList();
  } else if (
    catalog === "women" ||
    catalog === "men" ||
    catalog === "accessories"
  ) {
    productList();
  } else {
    searchPage();
  }
}

function searchPage() {
  //取得網址後關鍵字
  const word = location.href;
  //空白搜尋，跳回product/all
  if (!word.split("=")[1]) {
    catalog = "all";
    productList();
  } else {
    catalog = "search?keyword=";
    keyword = word.split("=")[1];
    symbol = "&";
    productList();
  }
}

//輪播
async function getCampaignsData() {
  const campaignsData = await fetch(
    `${host_name}/marketing/campaigns`
  ).then((res) => res.json());
  const { data } = campaignsData;
  return data;
}

async function campaignsPage() {
  const data = await getCampaignsData();
  const campaign = document.querySelector(".campaign");
  const dots = document.querySelector(".dots");

  data.forEach((data) => {
    const a = document.createElement("a");
    const heading = document.createElement("div");
    const h2 = document.createElement("h2");
    const dot = document.createElement("div");
    let { picture, story, product_id } = data;

    a.className = "slideshow";
    a.setAttribute("href", `product.html?id=${product_id}`);
    heading.className = "heading";
    h2.className = "story";
    dot.className = "dot";

    story = story.replace(/\r\n/g, "</br>");

    h2.innerHTML = `${story}`;
    a.style.backgroundImage = `url(${picture})`;
    heading.appendChild(h2);
    a.appendChild(heading);
    campaign.appendChild(a);
    dots.appendChild(dot);
  });
}

function carouselTimeShow() {
  const slide = document.querySelectorAll(".slideshow");
  const dots = document.querySelectorAll(".dot");
  slide.forEach((e, idx) => {
    e.style.display = "none";
    dots[idx].className = "dot";
  });

  slide[index].style.display = "block";
  dots[index].className = "dot active";
  if (index < slide.length - 1) {
    index++;
  } else {
    index = 0;
  }
}

function dotClick() {
  const slide = document.querySelectorAll(".slideshow");
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      for (let i = 0; i < dots.length; i++) {
        dots[i].className = "dot";
        slide[i].style.display = "none";
      }
      slide[idx].style.display = "block";
      dots[idx].className = "dot active";
      index = idx;
    });
  });
}

async function slideCarousel() {
  await campaignsPage();

  carouselTimeShow();
  window.setInterval(carouselTimeShow, 5000);

  dotClick();
  
}


setTimeout(catalogPage, 500);

