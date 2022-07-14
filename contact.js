window.addEventListener("load", loadTollFreeNumber);

function loadTollFreeNumber() {
  const Http = new XMLHttpRequest();
  const url = "http://localhost:3002/contatcts/toll-free";
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    document.getElementById("abcd").innerHTML = Http.responseText;
  };
}
