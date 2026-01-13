/*Origin rute*/
const path = window.location.origin;

/*Import resources*/
class Import extends HTMLElement{
    connectedCallback(){
        
        let icon = document.createElement('link');
        icon.rel = 'icon';
        icon.type = 'image/x-icon';
        icon.href = `${path}/imagenes/burrito.ico`;

        let linkElem = document.createElement('link');
        linkElem.rel = 'stylesheet';
        linkElem.href = `${path}/estilos/estilosIndex.css`;

        let linkMenu = document.createElement('link');
        linkMenu.rel = 'stylesheet';
        linkMenu.href = `${path}/estilos/estilosmenus.css`;
        
        let scriptElem = document.createElement('script');
        scriptElem.type = "module";
        scriptElem.src = `${path}/script/module.js`;

        let scriptElem2 = document.createElement('script');
        scriptElem2.src = `${path}/script/scripts.js`;

        document.head.appendChild(icon);
        document.head.appendChild(linkElem);
        document.head.appendChild(linkMenu);
        document.getElementsByTagName('html')[0].appendChild(scriptElem2);
        document.head.appendChild(scriptElem);
    }
}

customElements.define('import-container',Import);