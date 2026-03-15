
const url = "https://drive.google.com/file/d/1d8qQcE-a8ueQ18D9I394F28Hw04JId7E/view?usp=sharing";
const idMatch = url.match(/\/d\/([^/?]+)|id=([^&]+)/);
const id = idMatch ? (idMatch[1] || idMatch[2]) : null;

console.log("URL:", url);
console.log("Match:", idMatch);
console.log("Extracted ID:", id);
console.log("Generated Link:", `https://drive.google.com/uc?export=view&id=${id}`);
