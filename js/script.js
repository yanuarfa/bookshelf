window.onscroll = function () {
  const nav = document.querySelector("nav");

  if (window.pageYOffset > 0) {
    nav.classList.add("navblur");
  } else {
    nav.classList.remove("navblur");
  }
};

const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadLocalData() {
  const localData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(localData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateBooks(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookByIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveBooks() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const inputBooks = document.getElementById("inputBooks");
  const inputSearch = document.getElementById("findbook");

  inputBooks.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  inputSearch.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadLocalData();
  }
});

function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;
  const isComplete = document.getElementById("completed").checked;

  const bookObject = generateBooks(
    +new Date(),
    title,
    author,
    year,
    isComplete
  );

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  const wrapperContent = document.createElement("div");
  wrapperContent.classList.add("wrappercontent");
  wrapperContent.append(textTitle, textAuthor, textYear);

  const article = document.createElement("article");
  article.classList.add("bookitem");
  article.append(wrapperContent);
  article.setAttribute("id", bookObject.id);

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undobutton");

    undoButton.addEventListener("click", () => {
      readBookAgain(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("deletebutton");

    deleteButton.addEventListener("click", () => {
      deleteBook(bookObject.id);
    });

    const wrapperButton = document.createElement("div");
    wrapperButton.classList.add("action");
    wrapperButton.append(undoButton, deleteButton);

    article.append(wrapperButton);
  } else {
    const completedButton = document.createElement("button");
    completedButton.classList.add("checkbutton");

    completedButton.addEventListener("click", () => {
      completedReadBook(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("deletebutton");

    deleteButton.addEventListener("click", () => {
      deleteBook(bookObject.id);
    });

    const wrapperButton = document.createElement("div");
    wrapperButton.classList.add("action");
    wrapperButton.append(completedButton, deleteButton);

    article.append(wrapperButton);
  }

  return article;
}

function completedReadBook(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
}

function readBookAgain(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBooks();
}

function deleteBook(bookId) {
  const conf = confirm("Apakah anda yakin ingin menghapus buku?");
  if (conf) {
    const bookTarget = findBookByIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBooks();
  }
}

function searchBook() {
  const searchValue = document.getElementById("findtitle").value;
  const searchContent = document.getElementById("searchContent");
  if (searchValue == []) {
    searchContent.innerHTML = "";
  } else {
    const searchQuery = books.filter(function (e) {
      return e.title.toLowerCase().includes(searchValue.toLowerCase());
    });

    const searchElement = `
    <article class="bookitem">
      <div class="wrappercontent">
        <h3>${searchQuery[0].title}</h3>
        <p>${searchQuery[0].author}</p>
        <p>${searchQuery[0].year}</p>
      </div>
    </article>
    `;

    searchContent.innerHTML = searchElement;
  }
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("notCompleted");
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("alreadyCompleted");
  completedBookList.innerHTML = "";

  for (const book of books) {
    const bookElement = makeBook(book);
    if (!book.isComplete) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});
