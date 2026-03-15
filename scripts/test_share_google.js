const url = "https://share.google/images/pLlqDXs6tgcahaYoT";
const idMatch = url.match(/\/d\/([^/?]+)|id=([^&]+)|\/images\/([^/?]+)/);
const id = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3]) : null;

console.log("URL:", url);
console.log("Match result:", idMatch);
console.log("Extracted ID:", id);
console.log("Generated thumbnail URL:", `https://drive.google.com/thumbnail?id=${id}&sz=w1000`);
