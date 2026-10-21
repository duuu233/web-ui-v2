<script setup name="productVersionFpgaDetail">
import { useRoute } from 'vue-router'
import FpgaVersionEditor from './components/FpgaVersionEditor.vue'
const route = useRoute()
</script>

<template><FpgaVersionEditor mode="detail" :record-id="route.query.id" /></template>
