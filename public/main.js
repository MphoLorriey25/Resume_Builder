// Elements
const form = document.getElementById("resume-form");
const enhanceBtn = document.getElementById("enhance-summary");
const profileImageInput = document.getElementById("profileImage");
const imagePreview = document.getElementById("imagePreview");
const templateSelector = document.getElementById("templateSelector");
const downloadWordBtn = document.getElementById("downloadWord");

let selectedTemplate = "1";

// Template selection
templateSelector.addEventListener("click", (e) => {
  if (e.target.classList.contains("template-preview")) {
    [...templateSelector.children].forEach(img => img.classList.remove("selected"));
    e.target.classList.add("selected");
    selectedTemplate = e.target.dataset.template;
  }
});

// Image preview
profileImageInput.addEventListener("change", () => {
  const file = profileImageInput.files[0];
  if (!file) {
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.src = reader.result;
    imagePreview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

// Enhance summary with Cohere AI
enhanceBtn.addEventListener("click", async () => {
  const summaryField = document.getElementById("summary");
  if (!summaryField.value.trim()) {
    alert("Please enter a summary to enhance.");
    return;
  }

  enhanceBtn.disabled = true;
  enhanceBtn.textContent = "Enhancing...";
  const prompt = `Improve and professionalize this resume summary:\n\n${summaryField.value}\n\nImproved summary:`;

  try {
    const res = await fetch("/api/cohere.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.text) {
      summaryField.value = data.text.trim();
    } else {
      alert("Failed to enhance summary.");
    }
  } catch (e) {
    alert("Error contacting AI service.");
  } finally {
    enhanceBtn.disabled = false;
    enhanceBtn.textContent = "Enhance with AI";
  }
});

// Generate PDF on submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const resumeData = Object.fromEntries(formData.entries());

  // Add skills array
  resumeData.skills = resumeData.skills.split(",").map(s => s.trim()).filter(Boolean);
  resumeData.experience = resumeData.experience.split("\n").map(s => s.trim()).filter(Boolean);
  resumeData.education = resumeData.education.split("\n").map(s => s.trim()).filter(Boolean);
  resumeData.awards = resumeData.awards.split("\n").map(s => s.trim()).filter(Boolean);

  // Pass data and template to backend or generate PDF here
  generatePDF(resumeData, selectedTemplate);
});

// Download Word
downloadWordBtn.addEventListener("click", () => {
  const formData = new FormData(form);
  const resumeData = Object.fromEntries(formData.entries());

  resumeData.skills = resumeData.skills.split(",").map(s => s.trim()).filter(Boolean);
  resumeData.experience = resumeData.experience.split("\n").map(s => s.trim()).filter(Boolean);
  resumeData.education = resumeData.education.split("\n").map(s => s.trim()).filter(Boolean);
  resumeData.awards = resumeData.awards.split("\n").map(s => s.trim()).filter(Boolean);

  generateWord(resumeData, selectedTemplate);
});

// PDF generation using jsPDF + html2canvas
async function generatePDF(data, template) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Simple PDF content example (customize templates later)
  doc.setFontSize(22);
  doc.setTextColor("#7c3aed");
  doc.text(data.fullName || "", 20, 20);

  doc.setFontSize(14);
  doc.setTextColor("#000");
  if (data.email) doc.text(`Email: ${data.email}`, 20, 30);
  if (data.phone) doc.text(`Phone: ${data.phone}`, 20, 38);
  if (data.linkedin) doc.text(`LinkedIn: ${data.linkedin}`, 20, 46);
  if (data.github) doc.text(`GitHub: ${data.github}`, 20, 54);

  doc.setFontSize(16);
  doc.text("Professional Summary", 20, 66);
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(data.summary || "", 170), 20, 74);

  // Add experience
  doc.setFontSize(16);
  doc.text("Experience", 20, 94);
  doc.setFontSize(12);
  data.experience.forEach((item, i) => {
    doc.text(`- ${item}`, 25, 102 + i * 8);
  });

  // Add education
  const eduStart = 102 + data.experience.length * 8 + 10;
  doc.setFontSize(16);
  doc.text("Education", 20, eduStart);
  doc.setFontSize(12);
  data.education.forEach((item, i) => {
    doc.text(`- ${item}`, 25, eduStart + 8 + i * 8);
  });

  // Add awards
  const awardsStart = eduStart + 8 + data.education.length * 8 + 10;
  if (data.awards.length) {
    doc.setFontSize(16);
    doc.text("Awards", 20, awardsStart);
    doc.setFontSize(12);
    data.awards.forEach((item, i) => {
      doc.text(`- ${item}`, 25, awardsStart + 8 + i * 8);
    });
  }

  doc.save("resume.pdf");
}

// Word generation using docx.js
async function generateWord(data, template) {
  const { Document, Packer, Paragraph, TextRun } = window.docx;

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: data.fullName || "",
          heading: "Title",
          thematicBreak: true,
          color: "7c3aed"
        }),
        new Paragraph(`Email: ${data.email || ""}`),
        new Paragraph(`Phone: ${data.phone || ""}`),
        new Paragraph(`LinkedIn: ${data.linkedin || ""}`),
        new Paragraph(`GitHub: ${data.github || ""}`),
        new Paragraph(" "),
        new Paragraph({
          text: "Professional Summary",
          heading: "Heading1"
        }),
        new Paragraph(data.summary || ""),
        new Paragraph(" "),
        new Paragraph({
          text: "Experience",
          heading: "Heading1"
        }),
        ...data.experience.map(item => new Paragraph(`- ${item}`)),
        new Paragraph(" "),
        new Paragraph({
          text: "Education",
          heading: "Heading1"
        }),
        ...data.education.map(item => new Paragraph(`- ${item}`)),
        new Paragraph(" "),
        new Paragraph({
          text: "Awards",
          heading: "Heading1"
        }),
        ...data.awards.map(item => new Paragraph(`- ${item}`)),
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "resume.docx";
  link.click();
}
