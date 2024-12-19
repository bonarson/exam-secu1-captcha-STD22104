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
                        apiKey: 'rpFv5laMXyVO+DkSGnm53mhOyLcilvIc9JaMYkmAwpmdfIrnGhugkhEUtLHTe8UYvAq/nQ9tWDXAtxw6cc543tSienTdFm3QlAXUSmTOpING+p9WIuQHmvwTJM2kIMoRqmFzpepFGYXKTMClSBYdQXxSrkWSVgzdD0taWoCzVQa2oUE8NRNfWQEochbpw4d6kYfMD1+tKGDBtV5QPt6XLVdUJIstiK02ohEL+djWPCMCSIApWz/ffyBmf5t1SRM5Z6LkDgnPDnu2wBCHJTAoHG10DF/HO0b5l85PtDXa6rqdohuxbIz5zur/p3Yp2FiXUApocRk0OOF9gD4MNOVtlUuwwdsaSgBPBwk6kn+H8tZi+Pjq0IRSUfAh1QqfWzFLgYftXtzbCpwY2rsYqrVZ6JSuUZGSaWZURjS2ctrxDYOi+TTTMV3KnNIfTvAu2ueV6+/KmcrBSXKHD/brUhAbN0R5D499FBySIKtfF5aJPBS76QtHu4UFgDaeabeKqUiUOnOSk8Vr7b1DN8UptGey4eZuHhQqYePudWX8so9dqX88QAK1boEw7Ffi/m1QEF1EsWAWfnWXAlsqPPRA7i3uHo8jgZS93r+e0y6Usizcxi977rdlN9NjMF/avrGywFBelLbalojWHDDjvJhgJGAhr1Jz6uabVzhAPhN5GtRWXzA=_0_1',
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
