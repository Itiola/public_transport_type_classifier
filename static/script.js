async function classifyImage() {
  const input = document.getElementById("imageInput");
  const file = input.files[0];
  if (!file) {
    alert("Please select an image.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/predict", {
    method: "POST",
    body: formData
  });

  const result = await response.json();
  document.getElementById("result").innerText = `Prediction: ${result.label} (confidence: ${(result.confidence * 100).toFixed(2)}%)`;
}
