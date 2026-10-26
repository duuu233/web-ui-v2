<script setup name="productDeviceEdit">
import { useRoute } from 'vue-router'
import ProductDeviceEditor from './components/ProductDeviceEditor.vue'
const route = useRoute()
</script>

<template><ProductDeviceEditor mode="edit" :record-id="route.query.id" /></template>
