const uploadInput = document.getElementById('screenshotUpload');
const fileNameSpan = document.getElementById('fileName');
const getFeedbackBtn = document.getElementById('getFeedback');
const outputSection = document.querySelector('.outputSection p');

// Update filename display when user picks a file
uploadInput.addEventListener('change', () => {
    const files = uploadInput.files;
    if (files.length > 0) {
        fileNameSpan.textContent = Array.from(files).map(f => f.name).join(', ');
    } else {
        fileNameSpan.textContent = 'No file chosen';
    }
});

// On button click, send image to backend
getFeedbackBtn.addEventListener('click', async () => {
    const files = uploadInput.files;
    if (!files.length) {
        outputSection.textContent = 'Please upload at least one screenshot first.';
        return;
    }

    outputSection.textContent = 'Analyzing your design...';

    // Convert first image to base64
    const file = files[0];
    const reader = new FileReader();

    reader.onload = async () => {
        const base64Data = reader.result.split(',')[1]; // strip the data:image/...;base64, prefix
        const mimeType = file.type;

        try {
            const response = await fetch('/get-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64Data, mimeType })
            });

            const data = await response.json();
            outputSection.innerHTML = data.feedback
                .replace(/####\s*(.*?)(\n|$)/g, '<h4>$1</h4>')
                .replace(/###\s*(.*?)(\n|$)/g, '<h3>$1</h3>')
                .replace(/##\s*(.*?)(\n|$)/g, '<h3>$1</h3>')
                .replace(/^---\s*$/gm, '')                  // ← removes horizontal rule lines
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^[\*•]\s/gm, '• ')                // ← catches both * and existing • at line start
                .replace(/\n/g, '<br>');
        } catch (err) {
            outputSection.textContent = 'Error getting feedback. Is the server running?';
            console.error(err);
        }
    };

    reader.readAsDataURL(file);
});