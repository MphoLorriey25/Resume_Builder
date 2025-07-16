async function generateSummary() {
  const experience = document.getElementById("experience").value;
  const education = document.getElementById("education").value;
  const skills = document.getElementById("skills").value;

  const prompt = `Based on the following experience, education, and skills, write a professional 3-4 sentence resume summary:\n\nExperience:\n${experience}\n\nEducation:\n${education}\n\nSkills:\n${skills}\n\nSummary:`;

  const response = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  document.getElementById("summary").value = data.summary || "Error generating summary.";
}

