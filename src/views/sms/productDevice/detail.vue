<script setup name="productDeviceDetail">
import { useRoute } from 'vue-router'
import ProductDeviceEditor from './components/ProductDeviceEditor.vue'
const route = useRoute()
</script>

<template><ProductDeviceEditor mode="detail" :record-id="route.query.id" /></template>
