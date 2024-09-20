<script setup>
    
</script>
<template lang="">
    
    <input type="text" v-model="respostaAEditar.pregunta">
    <div v-for="resposta in respostaAEditar.respostes" :key="resposta.id">
        <input type="text" v-model="resposta.resposta">
        <input type="radio" :value="resposta.correcta" :name="respostaAEditar.id" @input="(e) => correctAnswer = resposta.id">
    </div>
    <button>Guardar</button>
</template>

<style scoped></style>