const express = require('express')
const file = require("./JSON/preguntes.json")
const fs = require('fs');
const path = require('path');
const app = express()
const port = 3000


app.get('/', (req, res) => {
   let gameQuestions = file.preguntes;
   let formattedGameQuestions = [];

   randomizeArray(gameQuestions);

   gameQuestions.forEach(pregunta => {
      formattedGameQuestions.push(questionFormatter(pregunta));
   });

   res.send(formattedGameQuestions)
});


app.get('/win', (req, res) => {
   const currentDate = new Date();
   const directoryName = currentDate.toISOString().split('T')[0];
   const directoryPath = path.join(__dirname, directoryName);

   if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
   }

   const filesInDirectory = fs.readdirSync(directoryPath);
   const fileName = `${filesInDirectory.length + 1}.json`;
   const filePath = path.join(directoryPath, fileName);

   fs.writeFileSync(filePath, 'Your file content here');

   res.send('File created successfully');
});


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