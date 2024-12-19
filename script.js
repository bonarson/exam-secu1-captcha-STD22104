document.getElementById('sequence-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const numberInput = document.getElementById('number');
    const outputContainer = document.getElementById('output-container');
    const captchaContainer = document.getElementById('captcha-container');

    const N = parseInt(numberInput.value, 10);

    // Replace form with output container
    document.getElementById('sequence-form').style.display = 'none';
    outputContainer.style.display = 'block';
    outputContainer.innerHTML = ''; // Clear previous output

    let captchaValidated = false;

    for (let i = 1; i <= N; i++) {
        try {
            const response = await fetch('https://api.prod.jcloudify.com/whoami', {
                method: 'GET',
            });

            if (response.status === 200) {
                outputContainer.innerHTML += `<p>${i}. Forbidden</p>`;
            } else if (response.status === 403 && !captchaValidated) {
                await new Promise((resolve) => {
                    AwsWafCaptcha.renderCaptcha(captchaContainer, {
                        apiKey: "YOUR_API_KEY",
                        onSuccess: () => {
                            captchaValidated = true;
                            resolve();
                        },
                        onError: (error) => {
                            alert('CAPTCHA Error: ' + error.message);
                        },
                    });
                });
            } else {
                throw new Error('Unexpected API response');
            }
        } catch (error) {
            console.error(error);
            outputContainer.innerHTML += `<p>${i}. Error</p>`;
        }

        // Wait for 1 second before the next request
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    alert('Sequence generation complete!');
});
