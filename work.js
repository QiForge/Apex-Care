document.getElementById("searchBtn").addEventListener("click", function () {
    let text = document.getElementById("searchInput").value;

    if (text === "") {
        alert("Please type something to search.");
    } else {
        alert("You searched for: " + text);
    }
});