const wikiNav = document.getElementById("wikiNav");
const wikiFrame = document.getElementById("wikiFrame");
const mobileBackBtn = document.getElementById("wikiBackBtn");
const gearWiki = document.querySelector(".gear-wiki");

let selectedFile = null;

function groupedArticles() {
  return articles.reduce((acc, article) => {
    if (!acc[article.category]) acc[article.category] = [];
    acc[article.category].push(article);
    return acc;
  }, {});
}

function setActiveItem(file) {
  wikiNav.querySelectorAll(".wiki-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.file === file);
  });
}

function openArticle(file) {
  selectedFile = file;
  wikiFrame.src = file;
  setActiveItem(file);
  if (window.matchMedia("(max-width: 900px)").matches) {
    gearWiki.classList.add("mobile-article-open");
  }
}

function renderWikiNav() {
  const groups = groupedArticles();
  const fragment = document.createDocumentFragment();

  Object.keys(groups).forEach((category) => {
    const section = document.createElement("section");
    section.className = "wiki-group";

    const heading = document.createElement("h3");
    heading.className = "wiki-group-title";
    heading.textContent = category;
    section.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "wiki-list";

    groups[category].forEach((article) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "wiki-item";
      btn.dataset.file = article.file;
      btn.textContent = article.title;
      btn.addEventListener("click", () => openArticle(article.file));
      li.appendChild(btn);
      list.appendChild(li);
    });

    section.appendChild(list);
    fragment.appendChild(section);
  });

  wikiNav.innerHTML = "";
  wikiNav.appendChild(fragment);
}

mobileBackBtn.addEventListener("click", () => {
  gearWiki.classList.remove("mobile-article-open");
});

window.addEventListener("resize", () => {
  if (!window.matchMedia("(max-width: 900px)").matches) {
    gearWiki.classList.remove("mobile-article-open");
  }
});

renderWikiNav();
if (articles.length > 0) {
  openArticle(articles[0].file);
}
