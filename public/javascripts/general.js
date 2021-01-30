window.addEventListener('load', sizeSpec);
window.addEventListener('resize', sizeSpec);

function sizeSpec() {
    document.getElementById('userResolution').innerHTML = window.innerWidth + ' x ' + window.innerHeight;
}

/**
 * MESSAGE FUNCTIONS
 */
function displayMessage(title, message) {
    var showMessage = document.getElementById("msgBox");
    showMessage.classList.remove("hidden");
    document.getElementById('messageTitle').innerHTML = title;
    document.getElementById('messageDesc').innerHTML = message;
    return true;
  }

function hideMessage() {
    var hideMessage = document.getElementById("msgBox");
    hideMessage.classList.add("hidden");
    document.getElementById('messageTitle').innerHTML = '';
    document.getElementById('messageDesc').innerHTML = '';
}