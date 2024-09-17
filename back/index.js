const express = require('express');
// const textFile = require("./JSON/preguntes.json");
// const file = JSON.parse(textFile);
const file = require("./JSON/preguntes.json");
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const app = express()
const port = 3000
let playerStates = [];


// app.use(bodyParser.json()); // support json encoded bodies
// app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.use(express.json()); //support regular json

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
app.post('/createQuestion', (req, res) => {
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
app.get('/readOne', (req, res) => {
   let idToFind = req.query.id;

   let question = file.preguntes.find(pregunta => pregunta.id == idToFind);

   if (question) {
      res.send({
         foundQuestion: true,
         question: question
      });
   } else {
      res.send({
         foundQuestion: false,
         question: {}
      });
   }
});

// Read All
app.get('/readAll', (req, res) => {
   res.send(file.preguntes);
});

// Update
app.put('/update', (req, res) => {
   res.send('Update')
});

// Delete
app.delete('/delete', (req, res) => {
   res.send('Delete')
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