<script setup>
import { ref, reactive, onMounted, watch } from 'vue'

const preguntes = ref([]);
const preguntaAEditar = ref(null);
const page = ref('preguntes');
const interactor = ref(null);
const correctAnswer = ref(null);


const getQuestions = async () => {
  const response = await fetch('http://localhost:3000/preguntes')
  const data = await response.json()
  return data;
}

const getQuestionById = async (id) => {
  const response = await fetch(`http://localhost:3000/preguntes/${id}`)
  const data = await response.json()

  if (data.foundQuestion) {
    return data.question;
  } else {
    return null;
  }
}

const changePage = (newPage) => {
  page.value = newPage;
}

const goToEdit = async (id) => {
  interactor.value = id;
  preguntaAEditar.value = await getQuestionById(id);
  page.value = 'editar'
  console.log("editant pregunta ", id);
}

const modalBorrar = (id) => {
  if (confirm(`Segur que vols borrar la pregunta ${id}?`)) {
    console.log("borrant pregunta ", id);
  } else {
    console.log("no borrem pregunta ", id);
  }
}

watch(correctAnswer, (newValue) => {
  preguntaAEditar.value.respostes.forEach((resposta) => {
    resposta.correcta = resposta.id === newValue;
  })
})

onMounted(async () => {
  preguntes.value = await getQuestions();

  console.log(preguntes.value)
})

</script>

<template>
  <button @click="changePage('afegir')">Afegir</button>
  <button @click="changePage('preguntes')">Mostrar preguntes</button>
  <div class="container--preguntes" v-if="page == 'preguntes'">
    <h1>Preguntes</h1>
    <div v-for="pregunta in preguntes" :key="pregunta.id" class="preguntes--pregunta">
      <div class="pregunta--id">
        {{ pregunta.id }}
      </div>
      <div class="pregunta--text">
        {{ pregunta.pregunta }}
      </div>
      <div class="pregunta--respostes">
        <div v-for="respAct in pregunta.respostes" :key="respAct.id" class="respostes--resposta"
          :class="respAct.correcta ? 'respostes--resposta__correcte' : 'respostes--resposta__incorrecte'">
          {{ respAct.resposta }}
        </div>
      </div>
      <div class="pregunta--opcions">
        <div class="opcions--editar">
          <button @click="goToEdit(pregunta.id)">Editar</button>
        </div>
        <div class="opcions--eliminar">
          <button @click="modalBorrar(pregunta.id)">Eliminar</button>
        </div>
      </div>

    </div>
  </div>
  <div v-else-if="page == 'editar'">
    <h1>Editar</h1>

    <div v-if="preguntaAEditar">
      <input type="text" v-model="preguntaAEditar.pregunta">
      <div v-for="resposta in preguntaAEditar.respostes" :key="resposta.id">
        <input type="text" v-model="resposta.resposta">
        <input type="radio" :value="resposta.id" :name="preguntaAEditar.id" v-model="correctAnswer">
      </div>
      <button>Guardar</button>
    </div>
  </div>
  <div v-else-if="page == 'afegir'">
    <h1>Afegir</h1>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.container--preguntes {
  display: grid;
  grid-template-columns: 1fr;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
}

.preguntes--pregunta {
  display: grid;
  grid-template-columns: 1fr 5fr 1fr 1fr;
  border: 1px solid black;
  border-radius: 5px;
  margin: 10px;
}

.pregunta--id {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pregunta--text {
  display: flex;
  justify-content: center;
  align-items: center;
}

.respostes--resposta {
  display: flex;
  justify-content: center;
}

.respostes--resposta__correcte {
  background-color: #cee3be;
}

.respostes--resposta__incorrecte {
  background-color: #f79c9b;
}

.pregunta--opcions {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  align-items: center;
}
</style>