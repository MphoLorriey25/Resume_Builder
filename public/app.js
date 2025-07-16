function generatePDF() {
  const doc = new window.jspdf.jsPDF();
  const reader = new FileReader();
  const photoInput = document.getElementById("photo").files[0];

  const formData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    linkedin: document.getElementById("linkedin").value,
    github: document.getElementById("github").value,
    summary: document.getElementById("summary").value,
    experience: document.getElementById("experience").value.split(","),
    education: document.getElementById("education").value.split(","),
    skills: document.getElementById("skills").value.split(","),
    awards: document.getElementById("awards").value.split(","),
    photo: null,
  };

  if (photoInput) {
    reader.onload = function (e) {
      formData.photo = e.target.result;
      generateTemplate(formData, doc);
      doc.save(`${formData.fullName || "resume"}.pdf`);
    };
    reader.readAsDataURL(photoInput);
  } else {
    generateTemplate(formData, doc);
    doc.save(`${formData.fullName || "resume"}.pdf`);
  }
}

