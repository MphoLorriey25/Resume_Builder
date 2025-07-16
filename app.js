const form = document.getElementById("resumeForm");
const photoInput = document.getElementById("photoInput");
const imagePreview = document.getElementById("imagePreview");
const generateSummaryBtn = document.getElementById("generateSummary");
const summaryField = document.getElementById("summary");
const templateSelect = document.getElementById("templateSelect");

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) {
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    imagePreview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

// Replace 'YOUR_COHERE_API_KEY' with your actual key
const COHERE_API_KEY = "YOUR_COHERE_API_KEY";

generateSummaryBtn.addEventListener("click", async () => {
  const name = form.fullName.value.trim();
  if (!name) {
    alert("Please enter your full name before generating summary.");
    return;
  }

  generateSummaryBtn.disabled = true;
  generateSummaryBtn.textContent = "Generating...";

  try {
    const prompt = `Write a professional resume summary for ${name} in 3 concise sentences.`;

    const response = await fetch("https://api.cohere.ai/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-xlarge-nightly",
        prompt,
        max_tokens: 60,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.generations && data.generations.length > 0) {
      summaryField.value = data.generations[0].text.trim();
    } else {
      alert("No summary generated. Try again.");
    }
  } catch (error) {
    alert("Error generating summary: " + error.message);
  } finally {
    generateSummaryBtn.disabled = false;
    generateSummaryBtn.textContent = "Generate Summary with AI";
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    fullName: form.fullName.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    linkedin: form.linkedin.value.trim(),
    github: form.github.value.trim(),
    summary: form.summary.value.trim(),
    experience: form.experience.value.trim().split("\n").filter(Boolean),
    education: form.education.value.trim().split("\n").filter(Boolean),
    awards: form.awards.value.trim().split("\n").filter(Boolean),
  };
  const selectedTemplate = templateSelect.value;

  generatePDF(data, selectedTemplate);
});

async function generatePDF(data, template) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add image if uploaded
  if (imagePreview.src && !imagePreview.classList.contains("hidden")) {
    try {
      doc.addImage(imagePreview.src, "JPEG", 150, 10, 40, 40);
    } catch (err) {
      console.warn("Failed to add image:", err);
    }
  }

  let y = 20;

  // Template 1 (modern purple)
  if (template === "1") {
    doc.setTextColor("#7c3aed");
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text(data.fullName || "", 20, y);
    y += 12;

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    if (data.email) doc.text(`Email: ${data.email}`, 20, y);
    y += 7;
    if (data.phone) doc.text(`Phone: ${data.phone}`, 20, y);
    y += 7;
    if (data.linkedin) doc.text(`LinkedIn: ${data.linkedin}`, 20, y);
    y += 7;
    if (data.github) doc.text(`GitHub: ${data.github}`, 20, y);
    y += 12;

    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(16);
    doc.setTextColor("#000");
    doc.setFont("helvetica", "bold");
    doc.text("Professional Summary", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(data.summary || "", 170);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 7 + 10;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Experience", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    data.experience.forEach((item) => {
      doc.text(`- ${item}`, 25, y);
      y += 7;
    });
    y += 10;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Education", 20, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    data.education.forEach((item) => {
      doc.text(`- ${item}`, 25, y);
      y += 7;
    });
    y += 10;

    if (data.awards.length) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Awards", 20, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      data.awards.forEach((item) => {
        doc.text(`- ${item}`, 25, y);
        y += 7;
      });
    }
  }

  // TODO: Add Template 2 & 3 here for variety

  doc.save(`${data.fullName || "resume"}.pdf`);
}
