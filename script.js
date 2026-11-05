
let currentPageUrl = 'https://rickandmortyapi.com/api/character'
let isLoading = false; 

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500;

let nextPageUrl = null;
let prevPageUrl = null;

window.onload = async () => {
    try {
        await loadCharacters(currentPageUrl);
        

    }catch(error) {
        console.log(error);
        alert('Error ao carregar cards');
    }

    const nextButton = document.getElementById('next-button')
    const backButton = document.getElementById('back-button')

    nextButton.addEventListener('click', loadNextPage)
    backButton.addEventListener('click', loadPreviousPage)

}

async function loadCharacters(newPageUrl) {

    console.log("Rodando loadCharacters")

    if (isLoading) return;

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        return;
    }

    isLoading = true;
    lastRequestTime = now;

    const mainContent = document.getElementById('main-content');

    try {
        const response = await fetch(newPageUrl);

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Muitas requisições! Aguarde um momento e tente novamente.');
            }

            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const responseJson = await response.json();

        mainContent.innerHTML = '';
        nextPageUrl = responseJson.info.next;
        prevPageUrl = responseJson.info.prev;

        console.log("Próxima página:", nextPageUrl);
        console.log("Página anterior:", prevPageUrl);

        responseJson.results.slice(0, 10).forEach((character) => {
            const card = document.createElement("div")
            card.style.backgroundImage = `url(${character.image})`
            card.className = "cards"

            const characterNameBG = document.createElement("div")
            characterNameBG.className = "character-name-bg"

            const characterName = document.createElement("span")
            characterName.className = "character-name"
            characterName.innerText = `${character.name}`

            characterNameBG.appendChild(characterName)
            card.appendChild(characterNameBG)

            card.onclick = () => {

                const modal = document.getElementById("modal")
                modal.classList.add("active")

                const modalContent = document.getElementById("modal-content")
                modalContent.innerHTML = ''

                const characterImage = document.createElement("div")
                characterImage.style.backgroundImage = `url(${character.image})`
                characterImage.className = "character-image"

                const title = document.createElement("h3")
                title.className = "character-title"
                title.innerText = character.name

                const createDetail = (label, value) => {
                    const detail = document.createElement("div")
                    detail.className = "character-details"
                    detail.innerHTML = `
                        <span class="detail-label">${label}</span>
                        <span class="detail-value">${value}</span>
                    `
                    return detail
                }

                const status = createDetail("Status", convertStatus(character.status))
                const species = createDetail("Espécie", convertSpecies(character.species))
                const gender = createDetail("Gênero", convertGender(character.gender))
                const origin = createDetail(
                    "Origem",
                    character.origin.name === "unknown" ? "Desconhecida" : character.origin.name
                )

                modalContent.appendChild(characterImage)
                modalContent.appendChild(title)
                modalContent.appendChild(status)
                modalContent.appendChild(species)
                modalContent.appendChild(gender)
                modalContent.appendChild(origin)
            }


            mainContent.appendChild(card)
        });

        const nextButton = document.getElementById("next-button")
        const backButton = document.getElementById("back-button")

        nextButton.disabled = !responseJson.info.next;
        backButton.disabled = !responseJson.info.prev;

        backButton.style.visibility = responseJson.info.prev? "visible" : "hidden"

        currentPageUrl = newPageUrl

    } catch (error) {
        alert(error.message);
        console.log(error);
    }finally {
        isLoading = false;
    }   

}


function hideModal() {
    const modal = document.getElementById("modal")
    modal.classList.remove("active")
}


function convertStatus(status) {
    const characterStatus = {
        alive: "vivo",
        dead: "morto",
        unknown: "desconhecido",
    };

    return characterStatus[status.toLowerCase()] || status;
}

function convertSpecies(specie) {
    const characterSpecie = {
        human: "humano",
        alien: "alienígena",
        humanoid: "humanoide",
        "mythological creature": "criatura mitológica",
        disease: "doença",
        robot: "robô",
        unknown: "desconhecido",
    };

    return characterSpecie[specie.toLowerCase()] || specie;
}

function convertGender(gender) {
    const characterGender = {
        male: "masculino",
        female: "feminino",
        genderless: "sem gênero",
        unknown: "desconhecido",
    };

    return characterGender[gender.toLowerCase()] || gender;
}


async function loadNextPage() {
    if (!nextPageUrl) return;

    await loadCharacters(nextPageUrl);
}


async function loadPreviousPage() {
    if (!prevPageUrl) return;

    await loadCharacters(prevPageUrl);
}

