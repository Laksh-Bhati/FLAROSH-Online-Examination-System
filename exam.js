var currentQuestion = 1;
var subject = new URLSearchParams(window.location.search).get("subject");
var totalQuestions = 0;
var currentQuestionId = "";

window.addEventListener("load", () => {
  const url = "http://localhost:3002/users/me";

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.setRequestHeader(
    "authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhr.onload = function () {
    // do something to response
    if (xhr.status == 200) {
      var user = JSON.parse(xhr.responseText);
      document.getElementById("username").innerHTML = user.userName;
      fetchQuestion();
      setToalQuestions();
    }
    if (xhr.status == 403 || xhr.status == 401) {
      logout();
      window.open("login.html", "_self");
    }
  };
  xhr.send();
});

window.addEventListener("unload", () => {
  if(!(currentQuestion > totalQuestions)){
    logout();
  }
});

function logout() {
  localStorage.removeItem("token");
  window.open("login.html", "_self");
}

function fetchQuestion() {
  if (currentQuestion != 1 && currentQuestion > totalQuestions) {
    window.open("result.html?subject=" + subject, "_self");
    return;
  }
  const url =
    "http://localhost:3002/questions/" + subject + "/" + currentQuestion;

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
      let question = JSON.parse(xhr.responseText);
      updateQuestionUi(question);
      currentQuestion = currentQuestion + 1;
      currentQuestionId = question.id;
    }
    if (xhr.status == 403 || xhr.status == 401) {
      window.open("login.html", "_self");
    }
  };
  xhr.send();
}

function updateQuestionUi(questionObj) {
  document.querySelector("#question").innerHTML =
    questionObj.serial_no + ". " + questionObj.question;
  document.querySelector("#opt1").innerHTML = " 1. " + questionObj.option1;
  document.querySelector("#opt2").innerHTML = " 2. " + questionObj.option2;
  document.querySelector("#opt3").innerHTML = " 3. " + questionObj.option3;
  document.querySelector("#opt4").innerHTML = " 4. " + questionObj.option4;
}

function setToalQuestions() {
  const url = "http://localhost:3002/subjects/" + subject + "/questions/counts";

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
      totalQuestions = JSON.parse(xhr.responseText).count;
    }
    if (xhr.status == 403 || xhr.status == 401) {
      window.open("login.html", "_self");
    }
  };
  xhr.send();
}

function submitAnswer() {
  var selectedOption = document.querySelector('input[name="options"]:checked');
  if (!selectedOption) {
    return;
  }
  sendResponse(selectedOption.value);
  fetchQuestion();
  selectedOption.checked = false;
}

function sendResponse(selectedOption) {
  const url = "http://localhost:3002/questions/responses";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhr.onload = function () {
    // do something to response
    if (xhr.status == 403 || xhr.status == 401) {
      window.open("login.html", "_self");
    }
  };
  var questionResponse = {
    questionId: currentQuestionId,
    selectedOpt: selectedOption,
  };
  console.log(questionResponse);
  xhr.send(JSON.stringify(questionResponse));
}
