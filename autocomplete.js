let availableKeywords = [
    'HTML',
    'CSS',
    'JavaScript',
    'PHP',
    'Python',
    'Web Design',
    'Web Development',
];

document.addEventListener('DOMContentLoaded', function () {
    const resultBox = document.querySelector(".result-box");
    const searchBox = document.querySelector("#search-box");

    searchBox.addEventListener('input', function () {
        let result = [];
        let input = searchBox.value;
        if (input.length) {
            result = availableKeywords.filter((keyword) => {
                return keyword.toLowerCase().includes(input.toLowerCase());
            });
        }
        display(result);
    });

    function display(result) {
        const content = result.map((list) => {
            return "<li onclick='selectInput(\"" + list + "\")'>" + list + "</li>";
        });

        resultBox.innerHTML = "<ul>" + content.join('') + "</ul>";
        resultBox.classList.toggle('show', result.length > 0);

        const searchBoxRect = searchBox.getBoundingClientRect();
        resultBox.style.top = searchBoxRect.bottom + 'px';
        resultBox.style.left = searchBoxRect.left + 'px';
    }
});

function selectInput(selectedValue) {
    searchBox.value = selectedValue;
    resultBox.innerHTML = "";
    resultBox.classList.remove('show');

    const inputEvent = new Event('input', { bubbles: true });
    searchBox.dispatchEvent(inputEvent);
}
