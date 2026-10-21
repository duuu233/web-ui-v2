<script setup name="productVersionFpgaAdd">
import { useRoute } from 'vue-router'
import FpgaVersionEditor from './components/FpgaVersionEditor.vue'
const route = useRoute()
</script>

<template><FpgaVersionEditor mode="add" :record-id="route.query.id" /></template>
