document.getElementById('sequence-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const numberInput = document.getElementById('number');
    const outputContainer = document.getElementById('output-container');
    const captchaContainer = document.getElementById('captcha-container');

    const N = parseInt(numberInput.value, 10);
    if (isNaN(N) || N < 1 || N > 1000) {
        alert('Veuillez entrer un nombre valide entre 1 et 1000.');
        return;
    }

    // Remplace le formulaire par la zone de sortie
    document.getElementById('sequence-form').style.display = 'none';
    outputContainer.style.display = 'block';
    outputContainer.innerHTML = ''; // Réinitialise la sortie précédente

    let captchaValidated = false;

    for (let i = 1; i <= N; i++) {
        try {
            const response = await fetch('https://api.prod.jcloudify.com/whoami', {
                method: 'GET', // Vérifiez si cette méthode est correcte
                headers: {
                    // Ajoutez ici des headers si requis, ex. :
                    // 'Authorization': 'Bearer YOUR_TOKEN',
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                // Requête réussie
                outputContainer.innerHTML += `<p>${i}. Forbidden</p>`;
            } else if (response.status === 403 && !captchaValidated) {
                // CAPTCHA requis
                await new Promise((resolve) => {
                    AwsWafCaptcha.renderCaptcha(captchaContainer, {
                        apiKey: 'iWrREWw9+T2ijgrchP7yURb9SFwPckCl+rgo9nHMNpRgoWOyLNP2NJvyHGfX54z8cS27AObqd7XQC0VZIHk3c7dMQDrAbG7qyDvlWX4z1RZ4z9gzpP8MRgnC+iC4nOtK14OaCoIyYov8FqlTf3EK4xDgfaj1xc/2NTVopF30g3I7KS7ZhQTKEZXB/xusH7yqEAbbkt9UpqRH7i6iCNC8etq2FqRxoTSz/wxEnI0zpozlDiGYLMoIVFdXZDVbM+WGnGpgluEC4MCGDTTghns3XvVJCVX9dMRSA1+95uBAnxONZr3Aq5izKq8ygxHvQjJrd2a+aRImE7ebTY9Sw8H9027b/aO0phwvA0UakNjWWMDax7Kq+OEV5eT7GlEiEMUpvomL2PoUbf+ZwTG1jWYC2iW0BGN3jKBEO2u9AQncbt5Jq+j/BZuukSYpI7V4Dwi364XoGPNrxbX2NJnh83+z5fdjvw4foVzPi8ZWghurJn/6sa3RLsS8573uRfjHIL4UVaO3e0chIKyEkVVmgtSOmKeQ/MKhDhajT6EECrkjvDdY+DJ9tGO4GlqBeYDzezkpGq1Hd0dgDvWKClwzK2q3iQd74tf+TIgornMqSS3OQ7Lf5fRFXjN12TyATogULvQk4Fw93hhzw+E9OLz/fp4ghd9wzMDPBvYu4oJlwi6Hopw=_0_1',
                        onSuccess: () => {
                            captchaValidated = true;
                            resolve();
                        },
                        onError: (error) => {
                            alert('Erreur CAPTCHA : ' + error.message);
                            resolve(); // Continue même en cas d'erreur
                        },
                    });
                });
            } else if (response.status === 405) {
                // Méthode non autorisée
                throw new Error('Méthode non autorisée (405). Vérifiez la documentation de l\'API.');
            } else {
                throw new Error(`Réponse inattendue de l'API : ${response.status}`);
            }
        } catch (error) {
            console.error('Erreur :', error.message);
            outputContainer.innerHTML += `<p>${i}. Erreur : ${error.message}</p>`;
        }

        // Attendez 1 seconde avant la prochaine requête
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    alert('Génération de séquence terminée !');
});
