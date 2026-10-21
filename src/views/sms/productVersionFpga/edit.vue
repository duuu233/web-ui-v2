<script setup name="productVersionFpgaEdit">
import { useRoute } from 'vue-router'
import FpgaVersionEditor from './components/FpgaVersionEditor.vue'
const route = useRoute()
</script>

<template><FpgaVersionEditor mode="edit" :record-id="route.query.id" /></template>
