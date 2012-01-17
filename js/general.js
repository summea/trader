function logger(text, newline) {

  // keep textarea focus at bottom
  document.getElementById('console').scrollTop =
    document.getElementById('console').scrollHeight;

  document.getElementById('console').innerHTML += text;
  if (newline === undefined) {
    document.getElementById('console').innerHTML += "\n";
  }
}
