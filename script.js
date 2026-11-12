const API_BASE_URL = "http://127.0.0.1:8001";
let selectedFile = null;
let currentLang = "en";
let lastPredictions = null;

// Bilingual Dictionary (Default English + Bangla Toggle)
const i18n = {
  en: {
    subtitle: "EfficientNetB0 MRI Diagnostic Assistant",
    connecting: "Connecting Server...",
    connected: "Local API Ready",
    waking: "Server Offline",
    badge: "Deep Learning · Transfer Learning (EfficientNetB0)",
    heroTitle: "Multi-Class Brain Tumor MRI Classification",
    heroDesc: "Upload a brain MRI scan to detect and classify Glioma, Meningioma, Pituitary Tumor, or No Tumor with confidence probability distribution.",
    uploadHeading: "1. Upload Brain MRI Scan",
    clearBtn: "Clear Image",
    dropText: "Click to upload or drag & drop MRI image",
    formatHint: "Supports JPG, JPEG, PNG (224×224 RGB auto-scaled)",
    analyzeBtn: "Analyze MRI Scan",
    analyzingBtn: "Analyzing...",
    resultHeading: "2. Diagnostic Classification Result",
    noResultYet: "No scan analyzed yet",
    noResultSub: "Upload an MRI image and click \"Analyze MRI Scan\" to view predictions.",
    analyzingText: "Running EfficientNetB0 Inference...",
    analyzingSub: "Extracting deep convolutional features from MRI scan",
    primaryDiagnosis: "Primary Classification",
    probBreakdown: "Class Probability Breakdown",
    disclaimer: "<strong>Academic & Research Disclaimer:</strong> This AI tool is developed for academic research and decision-support demonstration only. It is not a substitute for professional clinical diagnosis by a certified radiologist or neurologist.",
    classes: {
      "Glioma Tumor": {
        name: "Glioma Tumor",
        desc: "A tumor originating in the glial cells of the brain or spinal cord. Requires immediate neuro-oncological evaluation."
      },
      "Meningioma Tumor": {
        name: "Meningioma Tumor",
        desc: "A tumor arising from the meninges (membranes surrounding the brain and spinal cord). Often slow-growing and benign."
      },
      "Pituitary Tumor": {
        name: "Pituitary Tumor",
        desc: "An abnormal growth in the pituitary gland at the base of the brain that may affect hormone regulation."
      },
      "No Tumor": {
        name: "No Tumor Detected",
        desc: "The MRI scan shows normal brain morphology without detectable signs of glioma, meningioma, or pituitary mass."
      }
    }
  },
  bn: {
    subtitle: "EfficientNetB0 এমআরআই ডায়াগনস্টিক অ্যাসিস্ট্যান্ট",
    connecting: "সার্ভার সংযুক্ত হচ্ছে...",
    connected: "লোকাল API প্রস্তুত",
    waking: "সার্ভার বন্ধ আছে",
    badge: "ডিপ লার্নিং · ট্রান্সফার লার্নিং (EfficientNetB0)",
    heroTitle: "মাল্টি-ক্লাস ব্রেইন টিউমার এমআরআই ক্লাসিফিকেশন",
    heroDesc: "গ্লিওমা (Glioma), মেনিনজিওমা (Meningioma), পিটুইটারি টিউমার (Pituitary) অথবা টিউমার নেই কি না তা শনাক্ত করতে ব্রেইন এমআরআই স্ক্যান আপলোড করুন।",
    uploadHeading: "১. ব্রেইন এমআরআই স্ক্যান আপলোড করুন",
    clearBtn: "ছবি মুছুন",
    dropText: "এমআরআই ছবি আপলোড করতে ক্লিক করুন বা ড্র্যাগ করে ছাড়ুন",
    formatHint: "JPG, JPEG, PNG ফরম্যাট সমর্থিত (২২৪×২২৪ RGB অটো-স্কেল)",
    analyzeBtn: "এমআরআই স্ক্যান বিশ্লেষণ করুন",
    analyzingBtn: "বিশ্লেষণ চলছে...",
    resultHeading: "২. ডায়াগনস্টিক ফলাফল",
    noResultYet: "এখনও কোনো স্ক্যান বিশ্লেষণ করা হয়নি",
    noResultSub: "ফলাফল দেখতে একটি এমআরআই ছবি আপলোড করে \"এমআরআই স্ক্যান বিশ্লেষণ করুন\" বাটনে ক্লিক করুন।",
    analyzingText: "EfficientNetB0 মডেল দিয়ে বিশ্লেষণ চলছে...",
    analyzingSub: "এমআরআই স্ক্যান থেকে ডিপ কনভোলিউশনাল ফিচার যাচাই করা হচ্ছে",
    primaryDiagnosis: "প্রাথমিক শনাক্তকরণ",
    probBreakdown: "প্রতিটি ক্লাসের সম্ভাব্যতার হার",
    disclaimer: "<strong>গবেষণা ও একাডেমিক সতর্কতা:</strong> এই এআই টুলটি শুধুমাত্র একাডেমিক গবেষণা ও প্রদর্শনের জন্য তৈরি। এটি কোনো বিশেষজ্ঞ রেডিওলজিস্ট বা নিউরোলজিস্টের ক্লিনিক্যাল ডায়াগনসিসের বিকল্প নয়।",
    classes: {
      "Glioma Tumor": {
        name: "গ্লিওমা টিউমার (Glioma Tumor)",
        desc: "মস্তিষ্ক বা মেরুদণ্ডের গ্লিয়াল কোষ থেকে উৎপন্ন টিউমার। দ্রুত নিউরো-অনকোলজি বিশেষজ্ঞের পরামর্শ প্রয়োজন।"
      },
      "Meningioma Tumor": {
        name: "মেনিনজিওমা টিউমার (Meningioma Tumor)",
        desc: "মস্তিষ্কের আবরণী ঝিল্লি (Meninges) থেকে সৃষ্ট টিউমার। এটি সাধারণত ধীরগতিতে বৃদ্ধি পায়।"
      },
      "Pituitary Tumor": {
        name: "পিটুইটারি টিউমার (Pituitary Tumor)",
        desc: "মস্তিষ্কের নিচের পিটুইটারি গ্রন্থিতে সৃষ্ট টিউমার, যা শরীরের হরমোন নিঃসরণে প্রভাব ফেলতে পারে।"
      },
      "No Tumor": {
        name: "কোনো টিউমার শনাক্ত হয়নি (No Tumor)",
        desc: "এমআরআই স্ক্যানে মস্তিষ্কের গঠন স্বাভাবিক দেখাচ্ছে; গ্লিওমা, মেনিনজিওমা বা পিটুইটারি টিউমারের লক্ষণ পাওয়া যায়নি।"
      }
    }
  }
};

// DOM Elements
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");
const fileNameEl = document.getElementById("fileName");
const resetBtn = document.getElementById("resetBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const btnText = document.getElementById("btnText");
const errorBox = document.getElementById("errorBox");
const emptyResultState = document.getElementById("emptyResultState");
const loadingState = document.getElementById("loadingState");
const resultOutput = document.getElementById("resultOutput");
const langToggle = document.getElementById("langToggle");
const langLabel = document.getElementById("langLabel");

// Check Local FastAPI Server Status
async function checkServer() {
  const badge = document.getElementById("apiStatusBadge");
  const text = document.getElementById("apiStatusText");
  try {
    const res = await fetch(`${API_BASE_URL}/`);
    if (res.ok) {
      badge.classList.remove("connecting");
      badge.classList.add("connected");
      text.setAttribute("data-i18n", "connected");
      text.textContent = i18n[currentLang].connected;
    }
  } catch (err) {
    text.setAttribute("data-i18n", "waking");
    text.textContent = i18n[currentLang].waking;
  }
}
checkServer();

// Language Toggle Handler
langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "bn" : "en";
  langLabel.textContent = currentLang === "en" ? "বাংলা" : "English";
  applyTranslations();
  if (lastPredictions) renderResults(lastPredictions);
});

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (i18n[currentLang][key]) {
      el.innerHTML = i18n[currentLang][key];
    }
  });
}

// File Upload & Drag-Drop Handlers
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drop-active");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drop-active"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drop-active");
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    showError(
      currentLang === "en"
        ? "Please upload a valid image file (JPG/PNG)."
        : "অনুগ্রহ করে একটি সঠিক ছবি (JPG/PNG) আপলোড করুন।"
    );
    return;
  }
  hideError();
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    uploadPlaceholder.classList.add("hidden");
    previewContainer.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
    fileNameEl.textContent = file.name;
    analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

resetBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  selectedFile = null;
  lastPredictions = null;
  fileInput.value = "";
  previewImage.src = "";
  previewContainer.classList.add("hidden");
  uploadPlaceholder.classList.remove("hidden");
  resetBtn.classList.add("hidden");
  analyzeBtn.disabled = true;
  resultOutput.classList.add("hidden");
  emptyResultState.classList.remove("hidden");
  hideError();
});

// Run Inference via Local FastAPI Server
analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  hideError();
  analyzeBtn.disabled = true;
  btnText.textContent = i18n[currentLang].analyzingBtn;
  emptyResultState.classList.add("hidden");
  resultOutput.classList.add("hidden");
  loadingState.classList.remove("hidden");

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    lastPredictions = data.predictions;
    renderResults(lastPredictions);
  } catch (err) {
    console.error("Prediction Error:", err);
    loadingState.classList.add("hidden");
    emptyResultState.classList.remove("hidden");
    showError(
      currentLang === "en"
        ? "Cannot connect to local backend (port 8001). Make sure 'uvicorn server:app --port 8001' is running."
        : "লোকাল ব্যাকএন্ড সার্ভারের (port 8001) সাথে সংযোগ করা যাচ্ছে না। টার্মিনালে সার্ভার চালু আছে কি না নিশ্চিত করুন।"
    );
  } finally {
    analyzeBtn.disabled = false;
    btnText.textContent = i18n[currentLang].analyzeBtn;
  }
});

function renderResults(confidences) {
  loadingState.classList.add("hidden");
  resultOutput.classList.remove("hidden");

  const top = confidences[0];
  const isHealthy = top.label === "No Tumor";
  const topCard = document.getElementById("topPredictionCard");
  const topBadge = document.getElementById("topConfidenceBadge");
  const topName = document.getElementById("topClassName");
  const topDesc = document.getElementById("topClassDesc");

  if (isHealthy) {
    topCard.classList.remove("tumor-detected");
  } else {
    topCard.classList.add("tumor-detected");
  }

  const classMeta = i18n[currentLang].classes[top.label] || { name: top.label, desc: "" };
  topBadge.textContent = `${(top.confidence * 100).toFixed(2)}%`;
  topName.textContent = classMeta.name;
  topDesc.textContent = classMeta.desc;

  const listEl = document.getElementById("probabilityList");
  listEl.innerHTML = "";

  confidences.forEach((item, index) => {
    const pct = (item.confidence * 100).toFixed(2);
    const meta = i18n[currentLang].classes[item.label] || { name: item.label };
    let barClass = "prob-fill";
    if (index === 0) {
      barClass += item.label === "No Tumor" ? " top-healthy" : " top-tumor";
    }

    const row = document.createElement("div");
    row.innerHTML = `
      <div class="prob-row-top">
        <span>${meta.name}</span>
        <span>${pct}%</span>
      </div>
      <div class="prob-track">
        <div class="${barClass}" style="width: ${pct}%"></div>
      </div>
    `;
    listEl.appendChild(row);
  });
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}