getData = getDataFunction;
createModel =  createModelFunction;
prepareData = prepareDataFunction
trainModel = trainModelFunction;
displayData = displayDataFunction;
evaluateModel = evaluateModelFunction;
predict = predictFunction;

async function run() {
  
  const data = await getData();
  
  displayData(data);
  
	const model = createModel();  
	tfvis.show.modelSummary({name: 'Model Summary'}, model);

	const tensorData = prepareData(data);
	const {inputs, outputs} = tensorData;
		
	await trainModel(model, inputs, outputs, 50);
	console.log('Done Training');
  
  await evaluateModel(model, inputs, outputs);
  await predict(model);
}
function CSVToJSON(csvData) {
  var data = CSVToArray(csvData);
  var objData = [];
  for (var i = 1; i < data.length; i++) {
      objData[i - 1] = {};
      for (var k = 0; k < data[0].length && k < data[i].length; k++) {
          var key = data[0][k];
          objData[i - 1][key] = data[i][k]
      }
  }
  var jsonData = JSON.stringify(objData);
  jsonData = jsonData.replace(/},/g, "},\r\n");
  return jsonData;
}
function CSVToArray(csvData, delimiter) {
  delimiter = (delimiter || ",");
   var pattern = new RegExp((
  "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
  "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
  "([^\"\\" + delimiter + "\\r\\n]*))"), "gi");
  var data = [[]];
  var matches = null;
  while (matches = pattern.exec(csvData)) {
      var matchedDelimiter = matches[1];
      if (matchedDelimiter.length && (matchedDelimiter != delimiter)) {
          data.push([]);
      }
      if (matches[2]) {
          var matchedDelimiter = matches[2].replace(
          new RegExp("\"\"", "g"), "\"");
      } else {
          var matchedDelimiter = matches[3];
      }
      data[data.length - 1].push(matchedDelimiter);
  }
  return (data);
}
/**
  * @desc retrieves data from defined location
  * @return Sales data as json
*/
async function getDataFunction() {
  const SalesDataReq = await fetch('https://raw.githubusercontent.com/rananitesh8/DigitalMachine/main/train_data.csv');  
  const csvInput = await SalesDataReq.text();
  const inputs=JSON.parse(CSVToJSON(csvInput)); 
  let displayData = inputs.map(d => [d['product_identifier'],d['department_identifier'],d['category_of_product'],d['outlet'],d['state'],d['sales']])
  var productcat_dict = {'fast_moving_consumer_goods':0,
  'drinks_and_food':1,
  'others':2}
  var state_dict = {'Maharashtra':0,
  'Telangana':1,
  'Kerala':2}
  displayData = displayData.map(function(i) {   
    return [ parseInt(i[0]),parseInt(i[1]),productcat_dict[i[2]],parseInt(i[3]),state_dict[i[4]],parseInt(i[5])]
  })  
  console.log(displayData.length)
  return displayData.slice(0, 500);
}


/**
  * @desc plots one 
  * @param array values - array of values
  * @param string name - name of the plot
  * @param string xoutput - x name 
  * @param string youtput - y name
*/
function singlePlot(values, name, xoutput, youtput)
{
  tfvis.render.scatterplot(
    {name: name},
    {values}, 
    {
      xoutput: xoutput,
      youtput: youtput,
      height: 300
    }
  );
}

/**
  * @desc plots one 
  * @param json data - complete json that contains Sales quality data 
*/
function displayDataFunction(data){
  let displayData = data.slice(0, 5000).map(d => ({
    x: d[1],
    y: d[5],
  }));
console.log(displayData[0])
  singlePlot(displayData, 'Dept type v Sales', 'dept.', 'sales')

  displayData = data.slice(0, 5000).map(d => ({
    x: d[2],
    y: d[5],
  }));

  singlePlot(displayData, 'Category v sales', 'category', 'sales')

  displayData = data.slice(0, 5000).map(d => ({
    x: d[0],
    y: d[5],
  }));

  singlePlot(displayData, 'product v sales', 'product', 'sales')
}

/**
  * @desc creates tensorflow graph
  * @return model
*/
function createModelFunction() {
  const model = tf.sequential(); 
  model.add(tf.layers.dense({inputShape: [5], units: 50, useBias: true,
    activation: 'sigmoid',
    kernelInitializer: 'leCunNormal'}));
  model.add(tf.layers.dense({units: 10, useBias: true}));
  model.add(tf.layers.dense({units: 1, useBias: true})); 

  return model;
}

/**
  * @desc creates array of input data for every sample
  * @param json data - complete json that contains Sales quality data 
  * @return array of input data
*/
function extractInputs(data)
{ 
  let inputs = []  
  inputs = data.map(d => [d[0],d[1],d[2],d[3],d[4]])  
	return inputs;
}
function determineMeanAndStddev(data) {
  const dataMean = data.mean(0);
  const diffFromMean = data.sub(dataMean);
  const squaredDiffFromMean = diffFromMean.square();
  const variance = squaredDiffFromMean.mean(0);
  const dataStd = variance.sqrt();
  return {dataMean, dataStd};
}
function normalizeTensor(data, dataMean, dataStd) {
  return data.sub(dataMean).div(dataStd);
}
/**
  * @desc converts data from json format to tensors
  * @param json data - complete json that contains Sales quality data 
  * @return tuple of converted data that can be used for training model
*/
function prepareDataFunction(data) {
  
  return tf.tidy(() => {
    tf.util.shuffle(data);
    
    const inputs = extractInputs(data);
    const outputs = data.map(d => d[5]);
    
    const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);    
    const outputTensor = tf.tensor2d(outputs, [outputs.length, 1]);

    const inputMax = inputTensor.max();
    inputMax.print();
    const inputMin = inputTensor.min();  
    inputMin.print();
    const outputMax = outputTensor.max();
    outputMax.print();
    const outputMin = outputTensor.min();
    outputMin.print();
    const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
    const normalizedoutputs = outputTensor.sub(outputMin).div(outputMax.sub(outputMin));

    // Normalize mean and standard deviation of data.
  // let {dataMean, dataStd} =  determineMeanAndStddev(inputTensor);
  
  // const normalizedInputs = normalizeTensor(inputTensor, dataMean, dataStd); 
  // const normalizedoutputs =  normalizeTensor(outputTensor, dataMean, dataStd);
  // normalizedInputs.print();
  //   return {
  //     inputs: normalizedInputs,
  //     outputs: normalizedoutputs
  //   }
    return {
      inputs: normalizedInputs,
      outputs: normalizedoutputs,
      inputMin,
      inputMax,
      outputMin,
      outputMax
    }
  });  
}

/**
  * @desc trains model
  * @return trained model
*/
async function trainModelFunction(model, inputs, outputs, epochs) {
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['mse'],
  });
  
  const batchSize = 64;
  
  return await model.fit(inputs, outputs, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss', 'mse'], 
      { height: 200, callbacks: ['onEpochEnd'] }
    )
  });
}

/**
  * @desc evaluates the model
*/
async function evaluateModelFunction(model, inputs, outputs)
{
  const result = await model.evaluate(inputs, outputs, {batchSize: 64});  
  console.log('Loss is:')
  result[0].print();
  console.log('Accuracy is:')
  result[1].print();
}
async function predictFunction(model)
{
  console.log('Entered for predictions');  
  await model.predict(tf.tensor2d([74, 11, 2, 111, 0], [1,5])).print(true);
}

document.addEventListener('DOMContentLoaded', run);

