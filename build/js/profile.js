const memberDiv = document.querySelector(".profile_details");
const image = document.querySelector("#profile_image");
const name = document.querySelector(".name");
const email = document.querySelector(".email");
const logoutButton = document.querySelector("#log-out");
const loading = document.querySelector(".loading");

window.fbAsyncInit = function () {
  window.FB.init({
    appId: 461199461855229,
    cookie: true,
    xfbml: true,
    version: "v10.0",
  });
  profilePage();
};
(function (d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");


function profilePage() {
  window.FB.getLoginStatus(function (res) {
    if (res.status !== "connected") {
      location.href = "./index.html";
    } else {
      const access = window.FB.getAccessToken();
      getProfile(access).then((data) => {
        image.src = data.user.picture;
        name.innerHTML = data.user.name;
        email.innerHTML = data.user.email;
        setTimeout(showProfilePage, 1500);
      });
    }
  });
}

function showProfilePage() {
  loading.style.display = "none";
  memberDiv.style.opacity = 1;
}

logoutButton.addEventListener("click", () => {
  if (confirm("確定登出嗎?") === true) {
    window.FB.logout(() => {
      memberDiv.innerHTML = " ";
      location.href = "./index.html";
    });
  } else {
    return false;
  }
});

async function getProfile(res) {
  const userData = await fetch(
    "https://api.appworks-school.tw/api/1.0/user/signin",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "facebook",
        access_token: `${res}`,
      }),
    }
  ).then((res) => res.json());
  const { data } = userData;
  return data;
}
