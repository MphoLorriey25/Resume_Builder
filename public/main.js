const form = document.getElementById("resume-form");
const enhanceBtn = document.getElementById("enhance-summary");
const summaryField = document.getElementById("summary");
const downloadWordBtn = document.getElementById("download-word");
const imageInput = document.getElementById("profile-picture");
const imagePreview = document.getElementById("image-preview");
const templates = document.querySelectorAll(".template-select input");

// Preview uploaded image
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
  }
});

// Enhance summary with AI
enhanceBtn.addEventListener("click", async () => {
  const prompt = summaryField.value.trim();
  if (!prompt) {
    alert("Please enter a summary to enhance.");
    return;
  }

  enhanceBtn.disabled = true;
  enhanceBtn.textContent = "Enhancing...";

  try {
    const res = await fetch("/api/cohere", {  // <-- Corrected endpoint here
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

// Get selected template id
function getSelectedTemplate() {
  for (const t of templates) {
    if (t.checked) return t.value;
  }
  return "1"; // default
}

// Generate PDF on submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const resumeData = Object.fromEntries(formData.entries());

  // Process multi-line fields as arrays
  resumeData.skills = resumeData.skills.split(",").map(s => s.trim()).filter(Boolean);
  resumeData.experience = resumeData.experience.split("\n").map(s => s.trim()).filter(Boolean);
  resumeData.education = resumeData.education.split("\n").map(s => s.trim()).filter(Boolean);
  resumeData.awards = resumeData.awards.split("\n").map(s => s.trim()).filter(Boolean);

  const selectedTemplate = getSelectedTemplate();

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

  const selectedTemplate = getSelectedTemplate();

  generateWord(resumeData, selectedTemplate);
});

// PDF generation using jsPDF + embed image + template switch
async function generatePDF(data, template) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add profile picture if uploaded
  if (imagePreview.src && !imagePreview.classList.contains("hidden")) {
    try {
      doc.addImage(imagePreview.src, "JPEG", 150, 10, 40, 40);
    } catch (e) {
      console.warn("Failed to add image to PDF:", e);
    }
  }

  // Template styling examples:
  if (template === "1") {
    doc.setFontSize(22);
    doc.setTextColor("#7c3aed");
  } else if (template === "2") {
    doc.setFontSize(24);
    doc.setTextColor("#1d4ed8"); // blue
  } else if (template === "3") {
    doc.setFontSize(20);
    doc.setTextColor("#047857"); // green
  }

  // Name and contacts
  doc.text(data.fullName || "", 20, 30);
  doc.setFontSize(14);
  doc.setTextColor("#000");
  if (data.email) doc.text(`Email: ${data.email}`, 20, 38);
  if (data.phone) doc.text(`Phone: ${data.phone}`, 20, 46);
  if (data.linkedin) doc.text(`LinkedIn: ${data.linkedin}`, 20, 54);
  if (data.github) doc.text(`GitHub: ${data.github}`, 20, 62);

  // Summary
  doc.setFontSize(16);
  doc.setTextColor("#000");
  doc.text("Professional Summary", 20, 78);
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(data.summary || "", 170), 20, 86);

  // Experience
  let y = 106;
  doc.setFontSize(16);
  doc.text("Experience", 20, y);
  doc.setFontSize(12);
  y += 8;
  data.experience.forEach((item) => {
    doc.text(`- ${item}`, 25, y);
    y += 8;
  });

  // Education
  y += 8;
  doc.setFontSize(16);
  doc.text("Education", 20, y);
  doc.setFontSize(12);
  y += 8;
  data.education.forEach((item) => {
    doc.text(`- ${item}`, 25, y);
    y += 8;
  });

  // Awards (if any)
  if (data.awards.length) {
    y += 8;
    doc.setFontSize(16);
    doc.text("Awards", 20, y);
    doc.setFontSize(12);
    y += 8;
    data.awards.forEach((item) => {
      doc.text(`- ${item}`, 25, y);
      y += 8;
    });
  }

  doc.save("resume.pdf");
}

// Word generation using docx.js
async function generateWord(data, template) {
  const { Document, Packer, Paragraph } = window.docx;

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
