var i = 0
var ejecucion

function adaptacionmenu(){
    let table = document.getElementById('menu')
    let compStyle = getComputedStyle(table)
    let Columns = compStyle.getPropertyValue('grid-template-columns').split(' ').length
    console.log(Columns)
    let celda = document.getElementsByClassName('celdas')
    let ancho = getComputedStyle(celda[0]).getPropertyValue('width')
    let gridAuxiliar = document.getElementById('auxiliar')
    let cont = 0
    if(celda.length<=Columns)
        cont = 0
    else if(celda.length%Columns==0 && gridAuxiliar.children.length>0){
        for(var j=0; j<gridAuxiliar.children.length; j++){
            gridAuxiliar.children[0].children[0].children[0].style.width = null
            var elemento = gridAuxiliar.removeChild(gridAuxiliar.children[0])
            table.innerHTML +=`<div class='celdas'>${elemento.innerHTML}</div>`;
        }
    }
    else if(table.children.length%Columns!=0 && gridAuxiliar.children.length==0){
        let indice = table.children.length - (table.children.length%Columns)
        var resto = table.children.length - indice
        while(cont < resto){
            var elemento = table.removeChild(table.children[indice]);
            gridAuxiliar.innerHTML +=`<div class='celdas'>${elemento.innerHTML}</div>`;
            cont++
        }
        gridAuxiliar.style.gridTemplateColumns = `repeat(${resto}, 1fr)`;
    }
    else if(table.children.length%Columns!=0 && gridAuxiliar.children.length > 0){
        var resto = Columns - (table.children.length%Columns)
        var auxiliar = resto - gridAuxiliar.children.length
        while(gridAuxiliar.children.length > 0 && cont <= Math.abs(auxiliar)){
            gridAuxiliar.children[0].children[0].children[0].style.width = null
            var elemento = gridAuxiliar.removeChild(gridAuxiliar.children[0])
            table.innerHTML +=`<div class='celdas'>${elemento.innerHTML}</div>`;
            cont++
        }
    } 
    for(var j=0; j<gridAuxiliar.children.length; j++)
        gridAuxiliar.children[j].children[0].children[0].style.width = ancho
}

function ejecutaadaptacion(){
    ejecucion = setInterval(adaptacionmenu,100)
}
