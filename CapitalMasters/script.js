// Brand content: CapitalMasters
// If you want "CourseMasters" instead, search & replace 'CapitalMasters' in HTML and footer year injection.

// Data model for program levels
const levels = [
    {
      id: "informal",
      title: "Informal Financial Sector (VSLAs, SHGs, Money Lenders)",
      programs: [
        "Group Formation and Leadership Training",
        "Basic Savings and Loan Management",
        "Bookkeeping and Record-Keeping",
        "Conflict Resolution and Governance",
        "Financial Literacy and Digital Literacy"
      ]
    },
    {
      id: "tier-iv",
      title: "Microfinance and SACCO Development (Tier IV)",
      programs: [
        "Advanced Governance and Management",
        "Product Innovation and Risk Management",
        "Digital Financial Services Adoption",
        "Compliance with UMRA Regulations",
        "Linkage Building with Formal Financial Institutions"
      ]
    },
    {
      id: "tier-iii",
      title: "Microfinance Deposit-Taking Institutions (Tier III)",
      programs: [
        "Regulatory Compliance and Reporting",
        "Credit Risk Assessment and Portfolio Management",
        "Customer Relationship Management",
        "Technology Integration and Mobile Banking",
        "Financial Inclusion Strategies for Underserved Communities"
      ]
    },
    {
      id: "tier-ii",
      title: "Credit Institutions (Tier II)",
      programs: [
        "Corporate Governance and Leadership",
        "Advanced Credit Analysis and Lending Techniques",
        "Anti-Money Laundering and Fraud Prevention",
        "Foreign Exchange and Treasury Management",
        "SME and Agricultural Financing Solutions"
      ]
    },
    {
      id: "tier-i",
      title: "Commercial Banks (Tier I)",
      programs: [
        "Leadership Development for Financial Institutions",
        "Digital Transformation and Fintech Integration",
        "Sustainable and Inclusive Banking Practices",
        "Capital Markets and Investment Products",
        "Corporate Social Responsibility and Consumer Protection"
      ]
    },
    {
      id: "capital-markets",
      title: "Investment Funds and Capital Markets (Highest Level)",
      programs: [
        "Investment Analysis and Portfolio Management",
        "Capital Market Operations and Compliance",
        "Private Equity and Venture Capital Management",
        "Financial Product Innovation and Marketing",
        "Investor Education and Protection"
      ]
    }
  ];
  
  function renderLevels() {
    const grid = document.getElementById("levelsGrid");
    if (!grid) return;
    const frag = document.createDocumentFragment();
  
    levels.forEach((lvl) => {
      const article = document.createElement("article");
      article.className = "card";
      article.id = lvl.id;
  
      const inner = document.createElement("div");
      inner.style.padding = "1rem";
  
      const h3 = document.createElement("h3");
      h3.textContent = lvl.title;
  
      const ul = document.createElement("ul");
      lvl.programs.forEach((name) => {
        const li = document.createElement("li");
        const strong = document.createElement("span");
        strong.textContent = name;
        li.appendChild(strong);
        ul.appendChild(li);
      });
  
      inner.appendChild(h3);
      inner.appendChild(ul);
      article.appendChild(inner);
      frag.appendChild(article);
    });
  
    grid.appendChild(frag);
  }
  
  function setupNavToggle() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;
  
    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.style.display = "none";
    };
    const openMenu = () => {
      toggle.setAttribute("aria-expanded", "true");
      menu.style.display = "block";
    };
  
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? closeMenu() : openMenu();
    });
  
    // Close on click outside (mobile)
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        if (toggle.getAttribute("aria-expanded") === "true") closeMenu();
      }
    });
  
    // Close when a nav link is clicked (mobile)
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 767px)").matches) closeMenu();
      });
    });
  
    // Reset display on resize to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        menu.style.display = "flex";
        toggle.setAttribute("aria-expanded", "false");
      } else if (toggle.getAttribute("aria-expanded") !== "true") {
        menu.style.display = "none";
      }
    });
  }
  
  function validateEmail(email) {
    // Simple RFC 5322-lite pattern for client-side validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(String(email).toLowerCase());
  }
  
  function setupNewsletterForm() {
    const form = document.getElementById("newsletterForm");
    const email = document.getElementById("newsletterEmail");
    const msg = document.getElementById("newsletterMsg");
  
    if (!form || !email || !msg) return;
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-msg";
  
      const value = email.value.trim();
      if (!validateEmail(value)) {
        msg.textContent = "Please enter a valid email address.";
        msg.classList.add("error");
        return;
      }
  
      // Static-site demo: simulate success.
      // Integrate with your provider (Mailchimp, Sendy, SES, Brevo) by POSTing here.
      await new Promise((res) => setTimeout(res, 500));
      msg.textContent = "Thanks for signing up!";
      msg.classList.add("success");
      email.value = "";
    });
  }
  
  function setupContactForm() {
    const form = document.getElementById("contactForm");
    const msg = document.getElementById("contactMsg");
    if (!form || !msg) return;
  
    const fields = {
      name: form.querySelector("#name"),
      email: form.querySelector("#email"),
      message: form.querySelector("#message")
    };
  
    function setError(field, text) {
      const err = form.querySelector(`.field-error[data-for="${field.id}"]`);
      if (err) err.textContent = text || "";
    }
  
    function validate() {
      let ok = true;
      if (!fields.name.value.trim()) {
        setError(fields.name, "Your name is required.");
        ok = false;
      } else {
        setError(fields.name, "");
      }
  
      const emailVal = fields.email.value.trim();
      if (!emailVal) {
        setError(fields.email, "Your email is required.");
        ok = false;
      } else if (!validateEmail(emailVal)) {
        setError(fields.email, "Please provide a valid email.");
        ok = false;
      } else {
        setError(fields.email, "");
      }
  
      if (!fields.message.value.trim()) {
        setError(fields.message, "Please write a message.");
        ok = false;
      } else {
        setError(fields.message, "");
      }
  
      return ok;
    }
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "form-msg";
  
      if (!validate()) return;
  
      // Static-site demo: simulate sending.
      // To send for real, connect to a form backend (e.g., Formspree, Netlify Forms, AWS SES).
      await new Promise((res) => setTimeout(res, 700));
      msg.textContent = "Thanks! We'll get back to you soon.";
      msg.classList.add("success");
      form.reset();
    });
  }
  
  function setYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    renderLevels();
    setupNavToggle();
    setupNewsletterForm();
    setupContactForm();
    setYear();
  });