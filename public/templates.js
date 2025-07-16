function generateTemplate(data, doc) {
  let y = 20;
  doc.setFontSize(22);
  doc.text(data.fullName || "", 20, y);
  doc.setFontSize(12);
  y += 10;

  if (data.photo) {
    doc.addImage(data.photo, "JPEG", 160, 10, 30, 30);
  }

  doc.text(`Email: ${data.email}`, 20, y); y += 7;
  doc.text(`Phone: ${data.phone}`, 20, y); y += 7;
  if (data.linkedin) doc.text(`LinkedIn: ${data.linkedin}`, 20, y), y += 7;
  if (data.github) doc.text(`GitHub: ${data.github}`, 20, y), y += 10;

  if (data.summary) {
    doc.setFont("helvetica", "bold"); doc.text("Summary", 20, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.text(data.summary, 20, y); y += 10;
  }

  const sections = [
    { title: "Experience", items: data.experience },
    { title: "Education", items: data.education },
    { title: "Skills", items: data.skills },
    { title: "Awards", items: data.awards }
  ];

  sections.forEach(sec => {
    if (sec.items.length) {
      doc.setFont("helvetica", "bold"); doc.text(sec.title, 20, y); y += 6;
      doc.setFont("helvetica", "normal");
      sec.items.forEach(item => { doc.text(`- ${item}`, 25, y); y += 6; });
      y += 4;
    }
  });

  return doc;
}

