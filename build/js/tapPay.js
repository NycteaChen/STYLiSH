const fieldStatus = window.TPDirect.card;
const submit = document.querySelector("#confirmToPay");
const fieldText = document.querySelectorAll(".text");
const cardTextTitle = document.querySelectorAll(".cardTextTitle");
const loading = document.querySelector(".loading");
const main = document.querySelector("main");

window.TPDirect.setupSDK(
  12348,
  "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF",
  "sandbox"
);
window.TPDirect.card.setup({
  fields: {
    number: {
      element: "#card-number",
      placeholder: "**** **** **** ****",
    },
    expirationDate: {
      element: "#card-expiration-date",
      placeholder: "MM / YY",
    },
    ccv: {
      element: "#card-ccv",
      placeholder: "ccv",
    },
  },
  styles: {
    ".valid": {
      color: "green",
    },
  },
});

submit.addEventListener("click", () => {
  const cardPay = document.querySelector(".cardPay-in");
  const sum = calculateTextValidty();

  window.FB.getLoginStatus((res) => {
    if (res.status !== "connected") {
      submit.type = "button";
      alert("請先登入!");
    } else {
      cardPay
        ? checkFieldStatus(fieldStatus, sum)
        : sum === fieldText.length
        ? creditCardOnlyAlert()
        : (submit.type = "submit");
    }
  });
});


function creditCardOnlyAlert() {
  submit.type = "button";
  alert("目前僅供信用卡付款!");
}

//檢查訂購資料
function calculateTextValidty() {
  let valid = 0;
  fieldText.forEach((e) => {
    if (e.validity.valid === true) {
      valid += 1;
    }
  });
  return valid;
}

//選擇信用卡的情況下檢查是否確實填寫
function checkFieldStatus(update, sum) {
  if (update.getTappayFieldsStatus().canGetPrime === true) {
    sum === fieldText.length ? validPay() : (submit.type = "submit");
  } else {
    checkCreditStatus(update);
  }
}

//get prime and pay
function validPay() {
  submit.type = "button";
  window.TPDirect.card.getPrime((res) => {
    if (res.status !== 0) {
      console.err("getPrime 錯誤");
      return;
    } else {
      alert("購買成功!");
      main.style.display = "none";
      loading.style.display = "block";
      const prime = res.card.prime;
      const paymentInfo = getPurchaseData(prime);
      purchaseAPI(paymentInfo);
    }
  });
}

//信用卡欄位檢查
function checkCreditStatus(update) {
  submit.type = "button";
  const statusArray = [
    { status: "number"},
    { status: "expiry"},
    { status: "ccv"},
  ];

  statusArray.every((e, idx) => {
    if (update.getTappayFieldsStatus().status[e.status] === 2) {
      alert(`請輸入正確的${cardTextTitle[idx].textContent}!`);
      return false;
    } else if (update.getTappayFieldsStatus().status[e.status] === 0) {
      return true;
    } else {
      alert(`請輸入${cardTextTitle[idx].textContent}!`);
      return false;
    }
  });
}

//取得API body
function getPurchaseData(primeCode) {
  const time = Array.apply(
    null,
    document.querySelectorAll("input[type='radio']")
  );
  const checkedTime = time.filter((e) => e.checked === true);

  const recipientArray = [];
  fieldText.forEach((e) => recipientArray.push(e.value));
  const recipient = {
    name: recipientArray[0],
    email: recipientArray[1],
    phone: recipientArray[2],
    address: recipientArray[3],
    time: checkedTime[0].value,
  };

  const purchaseArray = JSON.parse(localStorage.getItem("cart"));
  const delivery = document.querySelector("#place").value;
  const payMethod = document.querySelector("#payMethod").value;
  const subtotal = document.querySelector("#purchaseSum").textContent;
  const freight = document.querySelector("#freight").textContent;
  const total = document.querySelector("#totalSum").textContent;
  const order = {
    shipping: delivery,
    payment: payMethod,
    subtotal: +subtotal,
    freight: +freight,
    total: +total,
    recipient: recipient,
    list: purchaseArray,
  };

  const paymentInfo = {
    prime: primeCode,
    order: order,
  };
  return paymentInfo;
}

//POST API & 轉址到thankyou page
async function purchaseAPI(paymentInfo) {
  /* eslint-disable */
  const newToken = await checkLoginStatus();
  const purchaseData = await fetch(
    "https://api.appworks-school.tw/api/1.0/order/checkout",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
      },
      body: JSON.stringify(paymentInfo),
    }
  ).then((res) => res.json());
  window.location.href = `thankyou.html?number=${purchaseData.data.number}`;
}
