/*Origin rute*/
const path = `${window.location.origin}${window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))}`;

const data = ['unidad2/u2_integradora.htm','unidad2/u2_intro.htm','unidad2/u2_t1.htm','unidad2/u2_t2.htm',
              'unidad2/u2_t3.htm','unidad2/u2_t4.htm','unidad2/u2_t5.htm'
              ,'unidad2/u2_t6.htm','unidad2/u2_t7.htm','unidad2/u2_t8.htm','unidad2/u2_t9.htm'
              ,'unidad2/u2_t10.htm','unidad2/u2_t11.htm','unidad1/u1_integra.htm','unidad1/u1_intro.htm',
            'unidad1/u1_t1.htm','unidad1/u1_t2.htm','unidad1/u1_t3.htm','unidad1/u1_t4.htm','unidad1/u1_t5.htm',
            'unidad1/u1_t6.htm','unidad1/u1_t7.htm','unidad1/u1_t8.htm','unidad1/u1_t9.htm'];

function clearText(string){
    string = string.replace(/<[^>]+>/g," ");
    string = string.replace(/\s+/,"~");
    string = string.toLowerCase();
    string = string.replace(/[áéíóú]/gi,function(e){
        return {'á':'a', 'é':'e', 'í':'i', 'ó':'o', 'ú':'u'}[e.toLowerCase()];
    });
    string = string.replace(/[^0-9a-zA-Z]+/g," ");
    return string;
}

let currentFilter = 'all'; // 'all', 'videos', 'pdfs', 'pages'

function setFilter(filter) {
    currentFilter = filter;
    // Eliminar la clase 'active' de todos los botones
    document.querySelectorAll('.filtros button').forEach(button => {
        button.classList.remove('active');
    });

    // Añadir la clase 'active' al botón presionado
    const activeButton = document.getElementById(`button_filtro_${filter}`);
    activeButton.classList.add('active');  
    search(); 
}

async function suggestion(string) {
    let aux = clearText(string).split(" ");
    
    let docs = new Map();
    let nt = new Map();
    aux.forEach(a => {
        nt.set(a, 0);    
    });
    let arrayR = new Map();
    let promises = data.map(unity => {
        return fetch(unity)
            .then(x => x.text())
            .then(sampleResp => {
                let list = [];
                let auxR = [];
                aux.forEach(element => {
                    if (element != "") {
                        const main = /<main>|<\/main>/g;
                        let text = clearText(sampleResp.split(main)[1]);
                        let sizeText = text.split(" ").length;
                        let count = text.split(element).length - 1;
                        list.push(count / sizeText);
                        if(count!=0)
                            nt.set(element, nt.get(element) + 1);
                    }
                });
                docs.set(unity, list);
            })
            .catch(error => {
                console.error(`Error fetching ${unity}:`, error);
                return null;
            });
    });
    await Promise.allSettled(promises);
    return [docs, nt];
}

async function resourcesFiles(fileSuggested) {
    let resources = [];
    let promises = fileSuggested.map(unity => {
        return fetch(unity[0])
            .then(x => x.text())
            .then(sampleResp => {
                let parser = new DOMParser();
                let html = parser.parseFromString(sampleResp, 'text/html');
                let media = new Set(Array.from(html.getElementsByTagName('video')).map(videoElement =>{ 
                                    let videoData = {link : videoElement.getAttribute('src'),
                                                     title : videoElement.getAttribute('title')};
                                    return JSON.stringify(videoData);
                            }));
                let uniqueMedia = Array.from(media).map(item => JSON.parse(item));

                let pdf = new Set(Array.from(html.getElementsByTagName('a')).map(pdfElement => {
                // Excluir enlaces que están dentro de un <td> que tiene una imagen
                    if (pdfElement.querySelector("img")) {
                        return null; // Ignorar este enlace
                    }
                    let pdfData = { 
                        link: pdfElement.getAttribute('href'), 
                        title: pdfElement.textContent.trim() // Título real del PDF
                    };
                    return JSON.stringify(pdfData);
                }).filter(item => item !== null)); // Eliminar los valores nulos

                        
                let uniquePDF = Array.from(pdf).map(item => JSON.parse(item));
                
                resources.push([`${unity[0]}`,html.title,uniqueMedia,uniquePDF]);              
            })
            .catch(error => {
                console.error(`Error fetching ${unity}:`, error);
                return null;
            });
    });
    await Promise.all(promises);
    return resources;
}

function search(){
    let string = document.getElementById('search_input').value;
    let X = suggestion(string);

    X.then(function(x) {
        let results = new Map();
        Array.from(x[0].keys()).forEach(key => {
            let fitness = 0;
            let i = 0;
            x[1].forEach(x1 => {
                if(x1 != 0)
                    fitness += Math.log10(x[0].size / x1) * x[0].get(key)[i];
                i++;
            });
            if(fitness > 0)
                results.set(key, [fitness]);
        });

        let table = Array.from(results).sort((a, b) => {
            return b[1][0] - a[1][0];
        });

        let text = "";
        let j = 0;
        let metaName = "";
        let resources = resourcesFiles(table);

        resources.then(function(R) {
            R.forEach(r => {
                // Filtrar según el filtro actual
                if (currentFilter === 'all' || 
                    (currentFilter === 'page' && r[0].match(/\.htm$/)) ||
                    (currentFilter === 'video' && r[2].length > 0) ||
                    (currentFilter === 'pdf' && r[3].length > 0)) {

                    // Mostrar página
                    if (currentFilter === 'all' || currentFilter === 'page') {
                        j++;
                        text += `<li id="${j}" class="item_text">
                                    <a href="${r[0]}#:~:text=${encodeURIComponent(string)}" target="new" style="text-decoration: none;">
                                        <p class="title_page">Página</p>${r[1]}
                                    </a>
                                  </li>`;
                    }
                    
                    // Mostrar video
                    r[2].forEach(videoSource => {
                        j++;
                        if (currentFilter === 'all' || currentFilter === 'video') {
                            text += `<li id="${j}" class="item_video" onclick="modal('${j}')">
                                        <p class="title_video">Video</p>${videoSource.title}
                                      </li>
                                      <dialog id="m${j}" class="exit_modal" onclick="exit_modal('${j}')">
                                        <video id="v${j}" src="${path}/${r[0].match(/(unidad\d+)\//)[1]}/${videoSource.link}" controls="controls"></video>
                                      </dialog>`;
                        }
                        console.log(`${path}/${r[0].match(/(unidad\d+)\//)[1]}/${videoSource.link}`);
                    });

                    // Mostrar PDF
                    r[3].forEach(pdfSource => {
                        j++;
                        if (currentFilter === 'all' || currentFilter === 'pdf') {
                            text += `<li id="${j}" class="item_pdf" onclick="openPDF('${path}/${r[0].match(/(unidad\d+)\//)[1]}/${pdfSource.link}')">
                                        <p class="title_pdf">PDF</p>${pdfSource.title}
                                     </li>`;
                        }
                    });
                }
            });

            document.getElementById('results').innerHTML = text.length > 0 ? 
            `<div class="title_search found">Resultados acerca de ${string}</div>` + `<ul>` + text + `</ul>` :
            `<div class="title_search not_found">Elemento no encontrado ${string}</div>`;

        });

        document.getElementById('contenedor').style.gridTemplateColumns = "repeat(auto-fit,minmax(min(100%,300px),1fr))";
        document.getElementById('results').style.display="grid";

        document.querySelectorAll('dialog.exit_modal').forEach(dialog => {
            dialog.addEventListener('click', function(event) {
        // Solo cerrar si el clic es fuera del video
            if (event.target === dialog) {
                dialog.close();
            }
        });

        // Prevenir cierre cuando se hace clic en el video
        const video = dialog.querySelector('video');
            if (video) {
                video.addEventListener('click', function(event) {
                    event.stopPropagation();
                });
            }
        });
    });
}

document.getElementById('search_input').addEventListener('keyup', function(event){
    if (event.key === 'Enter' && this.value.trim() !== '') {
        this.blur();
        search();
    }
});

function animation_bubbles(){
    let bubbles = document.getElementById("bubble")
    bubbles.innerHTML = "";
    for(let i=0; i<15; i++){
        bubbles.innerHTML += `<li class="animation_bubble"></li>`;
        bubbles.children[i].style.left =  Math.floor(Math.random() * (11)) * 10 + "%";
        let square = Math.floor(Math.random() * (100-20) + 20) + "px";
        bubbles.children[i].style.width = square;
        bubbles.children[i].style.height = square;
        let aux = Math.floor(Math.random() * (11));
        bubbles.children[i].style.animationDelay = aux + "s";
    }
}

function openPDF(pdfUrl) {
    window.open(pdfUrl, '_blank');
}


document.getElementById("bubble").children[0].addEventListener("animationstart",animation_bubbles);


function modal(ID){
    document.getElementById('m'+ID).classList.add('item_active');
}

function exit_modal(ID){
    document.getElementById('m'+ID).classList.remove('item_active');
    document.getElementById('v'+ID).currentTime = 0;
    document.getElementById('v'+ID).pause();
}

const voiceSearchBtn = document.getElementById("voiceSearchBtn");
const searchInput = document.getElementById("search_input");
let isRecognizing = false;
let recognition;

// Crear el reconocimiento de voz
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
} else {
    console.error("El reconocimiento de voz no está soportado en este navegador.");
}

// Función para pedir permiso de micrófono
async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Permiso de micrófono concedido.");
        startRecognition(); // Después de permiso, arrancamos el reconocimiento
    } catch (error) {
        console.error("Permiso de micrófono denegado o error:", error);
        alert("No se pudo acceder al micrófono. Permisos denegados o dispositivo no disponible.");
    }
}

// Función para iniciar o detener el reconocimiento
function startRecognition() {
    if (!recognition) return;

    if (isRecognizing) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Botón de búsqueda por voz
voiceSearchBtn.addEventListener("click", async function () {
    if (!recognition) return;

    // Primero pedimos permiso
    if (!isRecognizing) {
        await requestMicrophonePermission();
    } else {
        recognition.stop();
    }
});

// Manejadores de reconocimiento
recognition.onstart = () => {
    console.log('Reconocimiento de voz iniciado');
    isRecognizing = true;
    voiceSearchBtn.classList.add("active");
};

recognition.onend = () => {
    console.log('Reconocimiento de voz finalizado');
    isRecognizing = false;
    voiceSearchBtn.classList.remove("active");
};

recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
        } else {
            interimTranscript += event.results[i][0].transcript;
        }
    }

    console.log('Texto detectado:', finalTranscript || interimTranscript);
    searchInput.value = finalTranscript;
    search();
};

recognition.onerror = (event) => {
    console.error('Error en reconocimiento de voz:', event.error);

    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Permiso para usar el micrófono fue denegado.');
    } else if (event.error === 'network') {
        alert('Problema de red detectado.');
    }

    isRecognizing = false;
    voiceSearchBtn.classList.remove("active");
};







