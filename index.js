const express = require('express')
const morgan = require('morgan')
const axios = require('axios')
const mqtt = require('mqtt')
const mongoose = require('mongoose')
const moment = require('moment-timezone')
const { HumidModel, MoistModel, TempModel, PumpModel } = require('./config/data')
const cors = require('cors')
const WebSocket = require('ws')
const http = require('http')


const app = express()
app.use(cors())
app.use(morgan('combined'))



const port = 3000

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


wss.on('connection', function connection(ws) {
    console.log('--------- Client connected')
    

  const interval = setInterval( () => {
    axios
          .get(`https://io.adafruit.com/api/v2/dadn222/feeds`, {
            params: {
              'x-aio-key': "aio_ddNJ02LX7tRaCSKzfrjRwr0UZF5m",
            },
          })
          .then((res) => {
            // console.log(res.data)
            res.data.forEach( async element => {
                if (element.name === "humid"){

                    const instance = new HumidModel()
                    // console.log(element)
                    instance.value = element.last_value
                    instance.time = moment(element.updated_at).tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")
                    instance.name = element.name
                    await HumidModel.findOne({time: instance.time}).lean().then( async data => {
                      // console.log(data)
                      if (data === null) {
                        await instance.save()
                        await HumidModel.find().sort({_id: -1}).limit(5).lean().then(data => {
                          ws.send(JSON.stringify(data))
                          // console.log(data)
                        })
                      }
                    })
    
                }
                else if (element.name === "moist"){

                  const instance = new MoistModel()
                  // console.log(element)
                  instance.value = element.last_value
                  instance.time = moment(element.updated_at).tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")
                  instance.name = element.name
                  MoistModel.findOne({time: instance.time}).lean().then(data => {
                    // console.log(data)
                    if (data === null) {
                      instance.save()
                      MoistModel.find().sort({_id: -1}).limit(5).lean().then(data => {
                        ws.send(JSON.stringify(data))
                        // console.log(data)
                      })
                    }
                  })
  
                }
                else if (element.name === "temp"){

                  const instance = new TempModel()
                  // console.log(element)
                  instance.value = element.last_value
                  instance.time = moment(element.updated_at).tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")
                  instance.name = element.name
                  TempModel.findOne({time: instance.time}).lean().then(data => {
                    // console.log(data)
                    if (data === null) {
                      instance.save()
                      TempModel.find().sort({_id: -1}).limit(5).lean().then(data => {
                        ws.send(JSON.stringify(data))
                        // console.log(data)
                      })
                    }
                  })
                
                }
                else if (element.name === "pump"){
                  const instance = new PumpModel()
                  // console.log(element)
                  instance.time = moment(element.updated_at).tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")
                  instance.name = element.name
                  if (element.last_value === '0') {
                    instance.status = "Off"
                  }
                  else if (element.last_value === '1') {
                    instance.status = "On"
                  }
                  PumpModel.findOne({time: instance.time}).lean().then(data => {
                    // console.log(data)
                    if (data === null) {
                      instance.save()
                      PumpModel.find().sort({_id: -1}).limit(5).lean().then(data => {
                        ws.send(JSON.stringify(data))
                        console.log(data)
                      })
                    }
                  })
                }
            })
          })
          .catch((err) => {
            console.log(err);
          });
    }, 1000);
    
  });


server.listen(port, function(err) {
    if (err) {
        throw err;
    }
    console.log(`listening on port ${port}!`);
    // TempModel.deleteMany().then(function(){
    //       console.log("Data deleted"); // Success
    //   }).catch(function(error){
    //       console.log(error); // Failure
    //   });
    // console.log(server)
});


// app.get('/humidData', (req, res) => {
//     HumidModel.find().lean().then(data => res.send(data))
// })

// app.get('/moistData', (req, res) => {
//     MoistModel.find().lean().then(data => res.send(data))
// })

// app.get('/tempData', (req, res) => {
//     TempModel.find().lean().then(data => res.send(data))
// })

// app.get('/pumpData', (req, res) => {
//   PumpModel.find().lean().then(data => res.send(data))
// })


app.post('/clicked', (req, res) => {
  axios
          .get(`https://io.adafruit.com/api/v2/dadn222/feeds`, {
            params: {
              'x-aio-key': "aio_ddNJ02LX7tRaCSKzfrjRwr0UZF5m",
            },
          })
          .then((res) => {
            // console.log(res)
            var changeState = -1

            res.data.forEach(element => {
              if (element.name === "pump"){
                if (element.last_value === "0"){
                  changeState = 1
                }
                else if (element.last_value === "1"){
                  changeState = 0
                }
              }
            })
            
            axios
              .post(
                `https://io.adafruit.com/api/v2/dadn222/feeds/pump/data`,
                {
                  value: changeState
                },
                {
                  params: {
                    'x-aio-key': "aio_ddNJ02LX7tRaCSKzfrjRwr0UZF5m",
                  },
                }
              )
              .then(() => {
                console.log('success')
              });
            })

          .catch((err) => {
            console.log(err);
          });

})

