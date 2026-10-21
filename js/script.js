function escapeHTML(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}
function sanitizeText(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.textContent;
}
const adoptionInterests = [
  {
    id: 1,
    applicantName: "Aarav Sharma",
    animalName: "Buddy",
    animalType: "Dog",
    contact: "aarav@example.com",
    interestDate: "2026-10-05",
    status: "Pending",
    notes: "Looking for a family companion.",
    isDefault: true
  },
  {
    id: 2,
    applicantName: "Priya Verma",
    animalName: "Luna",
    animalType: "Cat",
    contact: "priya@example.com",
    interestDate: "2026-10-06",
    status: "Contacted",
    notes: "Has experience caring for cats.",
    isDefault: true
  },
  {
    id: 3,
    applicantName: "Rohan Singh",
    animalName: "Max",
    animalType: "Dog",
    contact: "rohan@example.com",
    interestDate: "2026-10-07",
    status: "Pending",
    notes: "Interested in arranging a visit.",
    isDefault: true
  },
  {
    id: 4,
    applicantName: "Neha Gupta",
    animalName: "Milo",
    animalType: "Cat",
    contact: "neha@example.com",
    interestDate: "2026-10-08",
    status: "Approved",
    notes: "Ready for the next adoption steps.",
    isDefault: true
  },
  {
    id: 5,
    applicantName: "Kabir Patel",
    animalName: "Rocky",
    animalType: "Dog",
    contact: "kabir@example.com",
    interestDate: "2026-10-09",
    status: "Pending",
    notes: "Would like more information about care.",
    isDefault: true
  }
];

let savedInterests = null;

try {
  savedInterests = localStorage.getItem("adoptqueue-records");
} catch (error) {
  console.error("[Storage] Unable to read saved adoption interests.", error);
}

if (savedInterests) {
  try {
    const storedInterests = JSON.parse(savedInterests);

    if (Array.isArray(storedInterests)) {
      storedInterests.forEach(function (interest) {
        if (interest && typeof interest === "object" && interest.isDefault !== true) {
          adoptionInterests.push(interest);
        }
      });
    }
  } catch (error) {
    console.error("[Storage] Saved adoption data is invalid.", error);

    try {
      localStorage.removeItem("adoptqueue-records");
    } catch (storageError) {
      console.error("[Storage] Unable to clear invalid saved data.", storageError);
    }
  }
}

const eventGrid = document.getElementById("event-grid");

function renderEvents(interestList) {
  eventGrid.innerHTML = "";

  interestList.forEach(function (interest) {
    const interestCard = document.createElement("article");
    interestCard.className = "event-card";

    interestCard.innerHTML = `
      <div class="event-card-top">
        <span class="event-category">${escapeHTML(interest.animalType)}</span>
        <span class="event-date">${escapeHTML(interest.interestDate)}</span>
      </div>
      <h3>${escapeHTML(interest.animalName)}</h3>
      <p class="event-author">Applicant: ${escapeHTML(interest.applicantName)}</p>
      <p class="event-description">${escapeHTML(interest.notes || "No additional notes.")}</p>
      <div class="event-details">
        <span>Status: ${escapeHTML(interest.status)}</span>
        <span>${escapeHTML(interest.contact)}</span>
      </div>
    `;

    if (interest.isDefault !== true) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-event-button";
      deleteButton.type = "button";
      deleteButton.setAttribute("aria-label", `Delete adoption interest for ${interest.applicantName}`);
      deleteButton.setAttribute("title", "Delete");
      deleteButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18"></path>
          <path d="M8 6V4h8v2"></path>
          <path d="m19 6-1 14H6L5 6"></path>
          <path d="M10 11v5M14 11v5"></path>
        </svg>
      `;

      deleteButton.addEventListener("click", function () {
        const interestIndex = adoptionInterests.indexOf(interest);

        if (interestIndex !== -1) {
          adoptionInterests.splice(interestIndex, 1);

          localStorage.setItem(
            "adoptqueue-records",
            JSON.stringify(
              adoptionInterests.filter(function (item) {
                return item.isDefault !== true;
              })
            )
          );

          console.log("[Analytics] User interacted with Adoption Interest Queue");
          filterEvents();
        }
      });

      interestCard.querySelector(".event-card-top").appendChild(deleteButton);
    }

    eventGrid.appendChild(interestCard);
  });
}

const searchInput = document.getElementById("event-search");
const categoryFilter = document.getElementById("event-filter");
const resetFilters = document.getElementById("reset-filters");

function filterEvents() {
  const searchText = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;
  console.log("Total interests:", adoptionInterests.length);

  const filteredInterests = adoptionInterests.filter(function (interest) {
    const searchableText = [
      interest.applicantName,
      interest.animalName,
      interest.animalType,
      interest.contact,
      interest.interestDate,
      interest.status,
      interest.notes
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(searchText);
    const matchesCategory =
      selectedCategory === "all" ||
      interest.animalType.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });
  const eventCount = document.getElementById("event-count");
  eventCount.textContent = `Showing ${filteredInterests.length} of ${adoptionInterests.length} adoption interests`;

  const emptyState = document.getElementById("empty-state");
  emptyState.hidden = filteredInterests.length !== 0;
  
  console.log("Filtered interests:", filteredInterests.length);
  renderEvents(filteredInterests);
}

searchInput.addEventListener("input", filterEvents);
categoryFilter.addEventListener("change", filterEvents);
resetFilters.addEventListener("click", function () {
  searchInput.value = "";
  categoryFilter.value = "all";
  filterEvents();
});

filterEvents();

const eventForm = document.getElementById("event-form");
const formStatus = document.getElementById("form-status");

function showFieldError(input, message) {
  const field = input.closest(".form-field");
  const error = field.querySelector(".field-error");

  field.classList.add("has-error");
  error.hidden = false;
  error.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearFieldError(input) {
  const field = input.closest(".form-field");
  const error = field.querySelector(".field-error");

  field.classList.remove("has-error");
  error.hidden = true;
  error.textContent = "";
  input.removeAttribute("aria-invalid");
}

const validationFields = [
  {
    input: document.getElementById("event-title"),
    validate: function (value) {
      return /^[A-Za-z][A-Za-z .'-]{1,79}$/.test(value)
        ? ""
        : "Enter a valid applicant name.";
    }
  },
  {
    input: document.getElementById("event-author"),
    validate: function (value) {
      return /^[A-Za-z0-9][A-Za-z0-9 .'-]{1,79}$/.test(value)
        ? ""
        : "Enter a valid animal name.";
    }
  },
  {
    input: document.getElementById("event-category"),
    validate: function (value) {
      return ["Dog", "Cat", "Rabbit", "Bird", "Other"].includes(value)
        ? ""
        : "Select an animal type.";
    }
  },
  {
    input: document.getElementById("event-location"),
    validate: function (value) {
      return value.length >= 3
        ? ""
        : "Enter valid contact details.";
    }
  },
  {
    input: document.getElementById("event-date"),
    validate: function (value) {
      if (!value) {
        return "Select an interest date.";
      }

      const selectedDate = new Date(value + "T00:00:00");

      return Number.isNaN(selectedDate.getTime())
        ? "Enter a valid date."
        : "";
    }
  },
  {
    input: document.getElementById("event-time"),
    validate: function (value) {
      return ["Pending", "Contacted", "Approved", "Completed"].includes(value)
        ? ""
        : "Select an adoption status.";
    }
  },
  {
    input: document.getElementById("event-description"),
    validate: function (value) {
      return value.length >= 3
        ? ""
        : "Enter notes of at least 3 characters.";
    }
  }
];

validationFields.forEach(function (item) {
  const eventName = item.input.tagName === "SELECT" ? "change" : "input";

  item.input.addEventListener(eventName, function () {
    const message = item.validate(item.input.value.trim());

    if (message) {
      showFieldError(item.input, message);
    } else {
      clearFieldError(item.input);
    }
  });
});

eventForm.addEventListener("submit", function (event) {
  event.preventDefault();

  formStatus.textContent = "";
  formStatus.className = "form-status";

  let firstInvalidInput = null;
  let isValid = true;

  validationFields.forEach(function (item) {
    const value = item.input.value.trim();
    const message = item.validate(value);

    if (message) {
      showFieldError(item.input, message);
      isValid = false;

      if (!firstInvalidInput) {
        firstInvalidInput = item.input;
      }
    } else {
      clearFieldError(item.input);
    }
  });

  if (!isValid) {
    formStatus.textContent = "Please correct the highlighted fields.";
    formStatus.classList.add("error");
    firstInvalidInput.focus();
    return;
  }

  const newInterest = {
    id: Date.now(),
    applicantName: sanitizeText(document.getElementById("event-title").value.trim()),
    animalName: sanitizeText(document.getElementById("event-author").value.trim()),
    animalType: document.getElementById("event-category").value,
    contact: sanitizeText(document.getElementById("event-location").value.trim()),
    interestDate: document.getElementById("event-date").value,
    status: document.getElementById("event-time").value,
    notes: sanitizeText(document.getElementById("event-description").value.trim())
  };

  adoptionInterests.push(newInterest);
  searchInput.value = "";
  categoryFilter.value = "all";

 try {
    localStorage.setItem(
      "adoptqueue-records",
      JSON.stringify(
        adoptionInterests.filter(function (item) {
          return item.isDefault !== true;
        })
      )
    );
  } catch (error) {
    console.error("[Storage] Unable to save adoption interests.", error);
    adoptionInterests.pop();

    formStatus.textContent =
      "Unable to save this adoption interest. Please check browser storage and try again.";
    formStatus.className = "form-status error";
    return;
  }

  filterEvents();
  revealNewEventCards();

  formStatus.textContent = "Adoption interest added successfully.";
  formStatus.className = "form-status success";

  eventForm.reset();

  validationFields.forEach(function (item) {
    clearFieldError(item.input);
  });

  console.log("[Analytics] User interacted with Adoption Interest Queue");
});
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
    const themeThumb = document.querySelector(".theme-toggle-thumb");

    if (theme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.setAttribute("aria-pressed", "true");
        themeToggle.setAttribute("aria-label", "Switch to light mode");
        themeThumb.textContent = "☾";
    } else {
        document.body.classList.remove("dark-mode");
        themeToggle.setAttribute("aria-pressed", "false");
        themeToggle.setAttribute("aria-label", "Switch to dark mode");
        themeThumb.textContent = "☀";
    }
}

const savedTheme = localStorage.getItem("adoptqueue-theme");

if (savedTheme) {
  applyTheme(savedTheme);
}

themeToggle.addEventListener("click", function () {
  const isDarkMode = document.body.classList.contains("dark-mode");

  if (isDarkMode) {
    applyTheme("light");
    localStorage.setItem("adoptqueue-theme", "light");
  } else {
    applyTheme("dark");
    localStorage.setItem("adoptqueue-theme", "dark");
  }
});

const navigationLinks = document.querySelectorAll(".nav-link");

function updateActiveNavigation() {
    const sections = [
        document.querySelector("#events"),
        document.querySelector("#add-event")
    ];

    let activeSection = sections[0];

    sections.forEach((section) => {
        if (section && window.scrollY >= section.offsetTop - 160) {
            activeSection = section;
        }
    });

    navigationLinks.forEach((link) => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${activeSection.id}`
        );
    });
}

navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
        navigationLinks.forEach((item) => {
            item.classList.remove("active");
        });

        link.classList.add("active");
    });
});

window.addEventListener("scroll", updateActiveNavigation);

updateActiveNavigation();

const revealElements = document.querySelectorAll(
  ".events-section, .event-card, .add-event-section, .footer-container"
);

const revealObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

revealElements.forEach(function (element) {
  element.classList.add("reveal-element");
  revealObserver.observe(element);
});
function revealNewEventCards() {
  const newCards = document.querySelectorAll(
    ".event-card:not(.reveal-visible)"
  );

  newCards.forEach(function (card) {
    card.classList.add("reveal-element");

    requestAnimationFrame(function () {
      card.classList.add("reveal-visible");
    });
  });
}

const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const mainNavigation = document.getElementById("main-navigation");

mobileMenuToggle.addEventListener("click", function () {
    const isOpen = mainNavigation.classList.toggle("menu-open");

    mobileMenuToggle.classList.toggle("active", isOpen);
    mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
    );
});

navigationLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        if (window.innerWidth <= 480) {
            mainNavigation.classList.remove("menu-open");
            mobileMenuToggle.classList.remove("active");
            mobileMenuToggle.setAttribute("aria-expanded", "false");
            mobileMenuToggle.setAttribute("aria-label", "Open menu");
        }
    });
});
document.addEventListener("click", function (event) {
    const clickedInsideMenu =
        mainNavigation.contains(event.target) ||
        mobileMenuToggle.contains(event.target);

    if (!clickedInsideMenu && mainNavigation.classList.contains("menu-open")) {
        mainNavigation.classList.remove("menu-open");
        mobileMenuToggle.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        mobileMenuToggle.setAttribute("aria-label", "Open menu");
    }
});

themeToggle.addEventListener("click", function () {
    if (window.innerWidth <= 480) {
        mainNavigation.classList.remove("menu-open");
        mobileMenuToggle.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        mobileMenuToggle.setAttribute("aria-label", "Open menu");
    }
});