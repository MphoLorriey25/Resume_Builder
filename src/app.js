// Get DOM elements
const form = document.getElementById("resumeForm");
const photoInput = document.getElementById("photoInput");
const imagePreview = document.getElementById("imagePreview");
const templateSelect = document.getElementById("templateSelect");

// Image preview handler
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
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

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Collect data from form
  const data = {
    fullName: form.fullName.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    linkedin: form.linkedin.value.trim(),
    github: form.github.value.trim(),
    summary: form.summary.value.trim(),
    experience: form.experience.value.trim().split("\n").filter(line => line.trim() !== ""),
    education: form.education.value.trim().split("\n").filter(line => line.trim() !== ""),
    awards: form.awards.value.trim().split("\n").filter(line => line.trim() !== ""),
  };

  const selectedTemplate = templateSelect.value;

  generatePDF(data, selectedTemplate);
});

async function generatePDF(data, template) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add profile picture (top right)
  if (imagePreview.src && !imagePreview.classList.contains("hidden")) {
    try {
      doc.addImage(imagePreview.src, "JPEG", 150, 10, 40, 40);
    } catch (e) {
      console.warn("Could not add image to PDF:", e);
    }
  }

  let y = 20;

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

    if (data.awards.length > 0) {
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
  } else if (template === "2") {
    doc.setTextColor("#1d4ed8");
    doc.setFontSize(28);
    doc.setFont("times", "bolditalic");
    doc.text(data.fullName || "", 20, y);
    y += 14;

    doc.setFontSize(13);
    doc.setFont("times", "normal");
    if (data.email) doc.text(`Email: ${data.email}`, 20, y);
    y += 8;
    if (data.phone) doc.text(`Phone: ${data.phone}`, 20, y);
    y += 8;
    if (data.linkedin) doc.text(`LinkedIn: ${data.linkedin}`, 20, y);
    y += 8;
    if (data.github) doc.text(`GitHub: ${data.github}`, 20, y);
    y += 14;

    doc.setDrawColor(29, 78, 216);
    doc.setLineWidth(0.7);
    doc.line(15, y, 195, y);
    y += 15;

    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text("Summary", 20, y);
    y += 10;
    doc.setFontSize(13);
    doc.setFont("times", "normal");
    const sumLines = doc.splitTextToSize(data.summary || "", 170);
    doc.text(sumLines, 20, y);
    y += sumLines.length * 8 + 15;

    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text("Experience", 20, y);
    y += 12;
    doc.setFontSize(13);
    doc.setFont("times", "normal");
    data.experience.forEach((item) => {
      doc.text(`• ${item}`, 25, y);
      y += 8;
    });
    y += 15;

    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text("Education", 20, y);
    y += 12;
    doc.setFontSize(13);
    doc.setFont("times", "normal");
    data.education.forEach((item) => {
      doc.text(`• ${item}`, 25, y);
      y += 8;
    });
    y += 15;

    if (data.awards.length > 0) {
      doc.setFontSize(18);
      doc.setFont("times", "bold");
      doc.text("Awards", 20, y);
      y += 12;
      doc.setFontSize(13);
      doc.setFont("times", "normal");
      data.awards.forEach((item) => {
        doc.text(`• ${item}`, 25, y);
        y += 8;
      });
    }
  } else if (template === "3") {
    doc.setTextColor("#047857");
    doc.setFontSize(24);
    doc.setFont("courier", "italic");
    doc.text(data.fullName || "", 25, y);
    y += 12;

    doc.setFontSize(12);
    doc.setFont("courier", "normal");
    if (data.email) doc.text(`Email: ${data.email}`, 25, y);
    y += 6;
    if (data.phone) doc.text(`Phone: ${data.phone}`, 25, y);
    y += 6;
    if (data.linkedin) doc.text(`LinkedIn: ${data.linkedin}`, 25, y);
    y += 6;
    if (data.github) doc.text(`GitHub: ${data.github}`, 25, y);
    y += 10;

    doc.setDrawColor(4, 120, 87);
    doc.setLineWidth(0.4);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(14);
    doc.setFont("courier", "italic");
    doc.text("Summary", 25, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("courier", "normal");
    const summaryLines = doc.splitTextToSize(data.summary || "", 165);
    doc.text(summaryLines, 25, y);
    y += summaryLines.length * 6 + 8;

    doc.setFontSize(14);
    doc.setFont("courier", "italic");
    doc.text("Experience", 25, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("courier", "normal");
    data.experience.forEach((item) => {
      doc.text(`- ${item}`, 30, y);
      y += 6;
    });
    y += 8;

    doc.setFontSize(14);
    doc.setFont("courier", "italic");
    doc.text("Education", 25, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("courier", "normal");
    data.education.forEach((item) => {
      doc.text(`- ${item}`, 30, y);
      y += 6;
    });
    y += 8;

    if (data.awards.length > 0) {
      doc.setFontSize(14);
      doc.setFont("courier", "italic");
      doc.text("Awards", 25, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont("courier", "normal");
      data.awards.forEach((item) => {
        doc.text(`- ${item}`, 30, y);
        y += 6;
      });
    }
  }

  doc.save("resume.pdf");
}
