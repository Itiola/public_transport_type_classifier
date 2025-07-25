const fileInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const resultBox = document.getElementById("result");
const predictBtn = document.getElementById("predictBtn");

let selectedFile = null;

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    selectedFile = file;
    showPreview(file);
    resultBox.textContent = "";
  }
});

predictBtn.onclick = async function () {
  if (!selectedFile) {
    resultBox.innerText = "Please select or capture an image.";
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  resultBox.innerText = "Classifying...";

  try {
    const response = await fetch("/predict", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    resultBox.innerText = `🚗 ${data.label}\n(${(data.confidence * 100).toFixed(1)}% confident)`;
  } catch (error) {
    resultBox.innerText = "Error: " + error.message;
  }
};

function showPreview(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    preview.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// Drag and drop
const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    selectedFile = file;
    showPreview(file);
  }
});

// Camera capture
const cameraBtn = document.getElementById("cameraBtn");
const cameraStream = document.getElementById("cameraStream");
const snapshotCanvas = document.getElementById("snapshotCanvas");
const snapBtn = document.getElementById("snapBtn");

cameraBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraStream.srcObject = stream;
    cameraStream.style.display = "block";
    snapBtn.style.display = "inline-block";
    preview.style.display = "none";
    resultBox.textContent = "";
  } catch (err) {
    alert("Unable to access camera.");
  }
};

snapBtn.onclick = () => {
  const context = snapshotCanvas.getContext("2d");
  snapshotCanvas.width = cameraStream.videoWidth;
  snapshotCanvas.height = cameraStream.videoHeight;
  context.drawImage(cameraStream, 0, 0);
  cameraStream.srcObject.getTracks().forEach(track => track.stop());
  cameraStream.style.display = "none";
  snapBtn.style.display = "none";

  snapshotCanvas.toBlob(blob => {
    selectedFile = new File([blob], "captured.png", { type: "image/png" });
    preview.src = URL.createObjectURL(blob);
    preview.style.display = "block";
  }, "image/png");
};
