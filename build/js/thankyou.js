const number = document.querySelector(".orderNumber");

// number
const url = new URL(location.href);
const numberParams = url.searchParams.get("number");
if (!numberParams) {
    location.href="./index.html";
} else {
  number.textContent = `${numberParams}`;
  localStorage.removeItem("cart");
}
