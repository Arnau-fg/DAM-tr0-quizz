const express = require('express');
// const textFile = require("./JSON/preguntes.json");
// const file = JSON.parse(textFile);
const file = require("./JSON/preguntes.json");
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const app = express()
const port = 3000
let playerStates = [];


app.use(express.json()); //support regular json
app.use(cors());

// inici joc

app.post('/', (req, res) => {
   let gameQuestions = file.preguntes;
   let formattedGameQuestions = [];
   const numOfQuestions = req.body.numOfQuestions || 10;

   const sessionToken = getSessionToken(req.body.token);

   randomizeArray(gameQuestions);

   const slicedGameQuestions = gameQuestions.slice(0, numOfQuestions);

   slicedGameQuestions.forEach(pregunta => {
      formattedGameQuestions.push(questionFormatter(pregunta));
   });

   playerStates[sessionToken] = slicedGameQuestions;

   console.log(playerStates);

   res.send({
      token: sessionToken,
      formattedGameQuestions
   })
});

// respostes

app.post('/finalitza', (req, res) => {
   const currentDate = new Date();
   const directoryName = currentDate.toISOString().split('T')[0];
   const directoryAnswers = path.join(__dirname, "answers");
   const directoryPath = path.join(directoryAnswers, directoryName);

   const sessionToken = req.body.token;

   if (!playerStates[sessionToken]) {
      res.send({
         valid: false,
      });
      return;
   }

   if (!req.body.answers) {
      res.send({
         valid: false,
      });
      return;
   }

   const playerAnswers = req.body.answers;

   let encertades = 0;
   const totals = playerStates[sessionToken].length;

   playerAnswers.forEach((answer, index) => {
      const respostaCorrecta = playerStates[sessionToken][index].respostes.find(resposta => {
         return resposta.correcta == true;
      });
      if (answer == respostaCorrecta.id) {
         encertades++;
      }
   });

   let playerScore = {
      encertades,
      totals
   }


   if (!fs.existsSync("answers")) {
      fs.mkdirSync("answers");
   }

   if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
   }

   const filesInDirectory = fs.readdirSync(directoryPath);
   const fileName = `${filesInDirectory.length + 1}.json`;
   const filePath = path.join(directoryPath, fileName);

   fs.writeFileSync(filePath, JSON.stringify(playerScore));

   res.send({
      valid: true,
      playerScore
   });
});

// ------------------- CRUD -------------------

// Create
app.post('/preguntes', (req, res) => {
   console.log(req.body);

   let newQuestion = {
      id: file.preguntes[file.preguntes.length - 1].id + 1,
      pregunta: req.body.pregunta,
      respostes: req.body.respostes
   }

   file.preguntes.push(newQuestion);

   fs.writeFileSync('./JSON/preguntes.json', file);

   res.send(req.body)
});

// Read
app.get('/preguntes/:id', (req, res) => {
   let objToSend = {};

   if (req.params.id) {
      let idToFind = req.params.id;

      let question = file.preguntes.find(pregunta => pregunta.id == idToFind);

      if (question) {
         objToSend = {
            foundQuestion: true,
            question: question
         }
      } else {
         objToSend = {
            foundQuestion: false,
            question: {}
         }
      }
   }

   res.send(JSON.stringify(objToSend));


});

// Read All
app.get('/preguntes', (req, res) => {
   res.send(file.preguntes)
});

// Update
app.put('/preguntes/:id', (req, res) => {

   let response = {};
   
   let idToFind = req.params.id;

   let question = file.preguntes.find(pregunta => pregunta.id == idToFind);

   if (question) {
      question.pregunta = req.body.pregunta;
      question.respostes = req.body.respostes;
      response = {
         updated: true,
         error: null
      }
   } else {
      response = {
         updated: false,
         error: "Question not found"
      }
   }

   fs.writeFileSync('./JSON/preguntes.json', file);

   res.send(response);
});

// Delete
app.delete('/preguntes/:id', (req, res) => {
   
   let response = {};

   let idToFind = req.params.id;

   let questionIndex = file.preguntes.findIndex(pregunta => pregunta.id == idToFind);

   if (questionIndex != -1) {
      file.preguntes.splice(questionIndex, 1);
      response = {
         deleted: true,
         error: null
      }
   } else {
      response = {
         deleted: false,
         error: "Question not found"
      }
   }

   fs.writeFileSync('./JSON/preguntes.json', file);

   res.send(response);
});


function getSessionToken(token) {
   if (!token) {
      token = uuidv4();
   }

   return token;
}

function questionFormatter(question) {
   let formattedQuestion, formattedAnswers;

   randomizeArray(question.respostes);

   formattedAnswers = formatAnswers(question.respostes);

   formattedQuestion = {
      id: question.id,
      pregunta: question.pregunta,
      respostes: formattedAnswers
   }

   return formattedQuestion;
}

function randomizeArray(respostes) {

   let currentIndex = respostes.length;

   // While there remain elements to shuffle...
   while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [respostes[currentIndex], respostes[randomIndex]] = [
         respostes[randomIndex], respostes[currentIndex]];
   }
}

function formatAnswers(answers) {
   let formattedAnswers = [];

   formattedAnswers = answers.map(({ id, resposta, imatge }) => {
      return {
         id,
         resposta,
         imatge
      }
   })

   return formattedAnswers;

}

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`)
})