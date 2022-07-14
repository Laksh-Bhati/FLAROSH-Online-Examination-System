document.querySelector("#login-form").addEventListener("submit", (event) => {
  loginUser();
  event.preventDefault();
}, false);

document.querySelector("#sign-up-form").addEventListener("submit", (event) => {
  createUser();
  event.preventDefault();
}, false);

function loginUser() {
    const url = "http://localhost:3002/logins";
  
    var userData = {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value
    };
  
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.onload = function () {
      if(xhr.status == 200){
        localStorage.setItem("token", JSON.parse(xhr.response).jwtToken);
        window.open("chooseExam.html", "_self");
      }else if(xhr.status == 400) {
          alert(JSON.parse(xhr.responseText).message);
      }else if(xhr.status == 401 || xhr.status == 401) {
        alert("Wrong email or password");
      }
    };
    xhr.send(JSON.stringify(userData));
  }

  function createUser() {
    const url = "http://localhost:3002/users";
  
    var userData = {
      userName: document.getElementById("user").value,
      hallTicketNo: document.getElementById("hall").value,
      university: document.getElementById("univ").value,
      course: document.getElementById("course").value,
      email: document.getElementById("email").value,
      password: document.getElementById("pass").value,
    };
  
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.onload = function () {
      if(xhr.status == 200){
          window.open("login.html", "_self");
          
      }else if(xhr.status == 400) {
          alert(JSON.parse(xhr.responseText).message);
      }
    };
    xhr.send(JSON.stringify(userData));
  }