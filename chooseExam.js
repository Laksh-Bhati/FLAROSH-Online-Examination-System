
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
      }
      if (xhr.status == 403 || xhr.status == 401) {
        window.open("login.html", "_self");
      }
    };
    xhr.send();
  });

  function logout() {
    localStorage.removeItem("token");
    window.open("login.html", "_self");
  }

  function selectSubject(subject) {
    window.open("exam.html?subject=" + subject, "_self");
  }