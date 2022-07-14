window.addEventListener("unload", () => {
  logout();
});

var subject = new URLSearchParams(window.location.search).get("subject");

function logout() {
  localStorage.removeItem("token");
  window.open("login.html", "_self");
}

window.addEventListener("load", () => {
  const url = "http://localhost:3002/users/me";

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhr.onload = function () {
    // do something to response
    if (xhr.status == 200) {
      var user = JSON.parse(xhr.responseText);
      document.getElementById("username").innerHTML = user.userName;
      getReport();
    }
    if (xhr.status == 403 || xhr.status == 401) {
      window.open("login.html", "_self");
    }
  };
  xhr.send();
});

function getReport() {
    const url = "http://localhost:3002/users/reports?subject=" + subject;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhr.onload = function () {
    // do something to response
    if (xhr.status == 200) {
      var report = JSON.parse(xhr.responseText);
      document.getElementById("total-quest").innerHTML = "Total number of questions : " + report.totalQuestions;
      document.getElementById("correct-quest").innerHTML = "Number of correct responses : " + report.correctResonses;
      var percentage = ((report.correctResonses/report.totalQuestions) * 100).toFixed(2);
      document.getElementById("percentage").innerHTML = "Percentage secured : " + percentage + "%";
    }
    if (xhr.status == 403 || xhr.status == 401) {
      window.open("login.html", "_self");
    }
  };
  xhr.send();
}


