const loginButton = document.querySelector("#login");



window.fbAsyncInit = function () {
  window.FB.init({
    appId: "461199461855229",
    xfbml: true,
    version: "v10.0",
  });
  window.FB.AppEvents.logPageView();
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

loginButton.addEventListener("click", () => {
  enterProfilePage();
});

function enterProfilePage() {
  window.FB.getLoginStatus(function (res) {
    if (res.status === "connected") {
      document.location.href = "profile.html";
    } else {
      login();
    }
  });
}

function login() {
  window.FB.login(
    function (res) {
      if (res.status === "connected") {
        checkLoginStatus();
      }
    },
    {
      scope: "public_profile, email",
      auth_type: "reauthorize",
    }
  );
}

function checkLoginStatus() {
  let access_token;
  window.FB.getLoginStatus(function (response) {
    if (response.status === "connected") {
      access_token = window.FB.getAccessToken();
    }
  });
  return getProfile(access_token);
}

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
  let newToken = data.access_token;
  return newToken;
}
