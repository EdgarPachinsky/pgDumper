const socket = io("http://localhost:7000");

let allPorts = []
let activePort = null
let scaleCount = 0;
let maxValueIndex = null;

let sensorCount = 0
let pixelCount = 0
let pixelsArray = []
let charts = []
let horizontalChart = null
let sensorsAllValues = []
let sensorsAllValuesChart = null
let maxValueFromAllPixels = null

socket.emit('get-ports', {})

socket.on('port-list',(data) => {

    for(const port of data)
        addOptionToSelect('port_select', port, port)

    document.getElementById('port_select').selectedIndex=0
    activePort = data[0]
})

socket.on('port-connection', (data) => {
    document.getElementById('msg').innerHTML = data.msg
})

socket.on('data-income', (data) => {
    sensorsAllValues = []

    // check if there is any data income
    data = data.line?data.line:""

    // check if data has any length and starts with #
    if(data === 0 || data.charAt(0) !== '#') {
        // console.log(`Data incorrect`)
        return
    }

    // delete starting #
    data = data.substr(1)

    // initialize variable to store some data info
    let valuesArray = {}

    // initialize array to store sensor maximum values
    let maxArray = []

    // loop through sensors and pixels
    for (let i = 0 ; i < sensorCount ; i ++){

        // init empty array
        valuesArray[i] = []

        // get rid of index character by its length , from main data string
        let index = i.toString()
        data = data.substr(index.length)

        for (let j = 0; j < pixelCount; j++) {

            // convert index to string
            index = j.toString()
            // calculate substring length
            // every data element contains 2 parts
            // first is an index 0, 1, 2,...,99 ,...
            // and a data part 2 bytes in hex
            // and all data part length that we need is an index length plus 2 (data 2 bytes)
            const substringLength = index.length + 2

            // get data part that we need
            const dataPart = data.slice(0, substringLength)
            // get last 2 bytes
            const hexValue = dataPart.slice(-2);
            // parse to integer
            const intVal = parseInt(hexValue, 16);
            // push int values
            valuesArray[i].push(intVal)
            // get substring from main data
            data = data.substr(substringLength)

            sensorsAllValues.push(intVal)
        }

        charts[i].data.labels = pixelsArray
        charts[i].data.datasets[0].data = valuesArray[i]
        charts[i].update()

        maxArray.push(Math.max(...valuesArray[i]))
    }


    horizontalChart.data.datasets[0].data = maxArray
    horizontalChart.update()

    maxValueFromAllPixels = Math.max(...sensorsAllValues)

    sensorsAllValuesChart.data.datasets[0].data = sensorsAllValues
    sensorsAllValuesChart.update()

    drawScalePoint()
})

function changeSelectedPort(el){
    activePort = el.value
}

function selectPort(){
    sensorCount = document.getElementById('scale_count').value
    pixelCount = document.getElementById('pixel_count').value
    scaleCount = sensorCount * pixelCount

    pixelsArray = []
    for (let i = 0; i < pixelCount; i++)
        pixelsArray.push(i)

    initGraphs()

    drawScaleNumbers()

    socket.emit('select-port',{
        port:activePort
    })
}

function addOptionToSelect(id, text, value){
    let comSelect = document.getElementById(id);
    comSelect.options[comSelect.options.length] = new Option(text, value);
}

function drawScalePoint(){

    document.getElementById('scale_tracker').innerHTML = ""

    const allPixelCount = pixelCount * sensorCount
    let itemHeight = 500 / allPixelCount

    let scaleNumberPlace = `
                        <div class="scale-numbers-item tracker-place-item" 
                             style="height: ${itemHeight}px;line-height: ${itemHeight}px"
                             id="tracker-place-__id__"
                        >
                            <span class="dash dash-laser-place">---</span>
                        </div>
                    `

    let scaleNumberPlaceEmpty = `
                        <div class="scale-numbers-item tracker-place-item" 
                             style="height: ${itemHeight}px;line-height: ${itemHeight}px"
                             id="tracker-place-__id__"
                        >
                        </div>
                    `
    let finalPlaceBlock = ``

    for (let i = allPixelCount - 1; i >=0 ; i--){

        let scalePlace = ''

        if(sensorsAllValues[i] === maxValueFromAllPixels)
            scalePlace = scaleNumberPlace.replace('__id__', i)
        else
            scalePlace = scaleNumberPlaceEmpty.replace('__id__', i)

        finalPlaceBlock += scalePlace
    }

    document.getElementById('scale_tracker').innerHTML = finalPlaceBlock
}

function drawScaleNumbers(){

    const allPixelCount = pixelCount * sensorCount
    let itemHeight = 500 / allPixelCount

    let scaleNumberBlock = `
                        <div class="scale-numbers-item" 
                             style="height: ${itemHeight}px;line-height: ${itemHeight}px"
                        >
                            __number__
                            <span class="dash">-</span>
                        </div>
                    `

    document.getElementById('scale_numbers').innerHTML = ""

    let finalNumbersBlock = ``

    for (let i = allPixelCount - 1; i >=0 ; i--){

        let divider = allPixelCount>=32?allPixelCount / 32:1
        let replacement = i%divider===0?i:""

        let scaleBlock = scaleNumberBlock.replace('__number__', replacement );

        finalNumbersBlock += scaleBlock

    }

    itemHeight =  500 / sensorCount
    scaleNumberBlock = `
                        <div class="scale-numbers-item border" 
                             style="height: ${itemHeight}px;line-height: ${itemHeight}px"
                        >
                            <span class="dash-left">-</span>
                            __number__
                            <span class="dash">-</span>
                        </div>
                    `

    let finalPlaceBlock = ``
    for (let i = sensorCount - 1; i >=0 ; i--){

        let sensorBlock = scaleNumberBlock.replace('__number__', i+1 );

        finalPlaceBlock += sensorBlock
    }


    document.getElementById('scale_numbers').innerHTML = finalNumbersBlock
    document.getElementById('scale_sensor_container').innerHTML = finalPlaceBlock
}

function initGraphs(){

    // get container and drop values , to refresh
    const graphWrapper = document.getElementById('graph-wrapper')
    const horizontalScale = document.getElementById('horizontal-scale-block')
    const horizontalScalePixels = document.getElementById('horizontal-scale-pixels-container')

    graphWrapper.innerHTML = ""
    horizontalScale.innerHTML = ""
    horizontalScale.horizontalScalePixels = ""

    charts = []
    sensorsAllValues = []
    horizontalChart = null

    const g_template = `
            <div class="col col-md-4">
                <div class="shadow-2">
                    <p>
                      <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapse-sensor-__id__" aria-expanded="false" aria-controls="collapse-sensor-__id__">
                        Hide/Open Graph for Sensor - __id__
                      </button>
                    </p>
        
                    <div class="collapse" id="collapse-sensor-__id__" aria-expanded="true">
                        <p>Sensor Number - __id__</p>
                        <canvas id="chart-__id__" style="width:100%;max-width:600px"></canvas>
                    </div>
                </div>
            </div>
        `

    const horizontalScaleChartTemplate = `
            <div class="col col-md-12">
                <div class="shadow-2">
                    <p>
                      <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#horizontal-scale" aria-expanded="false" aria-controls="horizontal-scale">
                        Hide/Open Graph
                      </button>
                    </p>
        
                    <div class="collapse" id="horizontal-scale" aria-expanded="true">
                        <canvas id="horizontal-scale-graph" style="width:100%;max-width:600px"></canvas>
                    </div>
                </div>
            </div>
        `

    const horizontalScalePixelsChartTemplate = `
            <div class="col col-md-12">
                <div class="shadow-2">
                    <p>
                      <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#horizontal-scale-pixels" aria-expanded="false" aria-controls="horizontal-scale-pixels">
                        Hide/Open Graph
                      </button>
                    </p>
        
                    <div class="collapse" id="horizontal-scale-pixels" aria-expanded="true">
                        <canvas id="horizontal-scale-graph-pixels" style="width:100%;max-width:600px"></canvas>
                    </div>
                </div>
            </div>
        `

    for (let i = 0; i < sensorCount; i++) {
        let g_example = g_template.replaceAll('__id__', i)

        graphWrapper.innerHTML = graphWrapper.innerHTML + g_example
    }

    horizontalScale.innerHTML = horizontalScaleChartTemplate
    horizontalScalePixels.innerHTML = horizontalScalePixelsChartTemplate

    for (let i = 0; i < sensorCount; i++)
        charts.push(getChartInstance(`chart-${i}`, pixelsArray))

    const sensorArray = []
    for (let i = 0; i < sensorCount; i++)
        sensorArray.push(i)

    const allPixelsArray = []
    const allPixelsLength = sensorCount * pixelCount
    for (let i = 0; i < allPixelsLength; i++)
        allPixelsArray.push(i)

    horizontalChart = getChartInstance('horizontal-scale-graph', sensorArray)
    sensorsAllValuesChart = getChartInstance('horizontal-scale-graph-pixels', allPixelsArray)
}

function getChartInstance(elId, xArray){

    return new Chart(elId, {
        type: "line",
        data: {
            labels: xArray,
            datasets: [{
                fill: false,
                lineTension: 0,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: []
            }]
        },
        options: {
            animation: true,
            legend: {display: false},
        }
    });
}
