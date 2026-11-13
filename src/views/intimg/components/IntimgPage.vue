<script setup name="IntimgPage">
import { useRoute, useRouter } from 'vue-router'
import '@/views/iot/iot.scss'
import '../intimg.scss'

defineProps({ title: String, subtitle: String, loading: Boolean })
defineEmits(['refresh'])
const route = useRoute()
const router = useRouter()
const links = [
  { name: 'intimgSlots', label: '槽位管理' },
  { name: 'intimgDevices', label: '设备内置图状态' },
  { name: 'intimgTaskCreate', label: '新建推送任务' },
  { name: 'intimgTasks', label: '推送任务列表', also: ['intimgTaskDetail'] },
  { name: 'intimgLocks', label: '设备锁排查' }
]
const active = link => route.name === link.name || (link.also || []).includes(route.name)
</script>

<template>
  <div class="app-container iot-page intimg-page">
    <header class="iot-heading">
      <div>
        <div class="iot-eyebrow"><span class="iot-pulse" /> XT IoT · 内置图管理</div>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      <div class="iot-header-actions">
        <slot name="actions" />
        <el-button icon="Refresh" :loading="loading" @click="$emit('refresh')">刷新</el-button>
      </div>
    </header>
    <div class="iot-subnav">
      <nav aria-label="内置图导航">
        <el-button
          v-for="link in links"
          :key="link.name"
          :type="active(link) ? 'primary' : 'default'"
          :plain="!active(link)"
          @click="router.push({ name: link.name })"
        >{{ link.label }}</el-button>
      </nav>
    </div>
    <div class="iot-data-note intimg-rule">
      <span>下发清单必须从 FACTORY 开始连续：只更新 FACTORY 就只发 FACTORY；要更新 NO_WIFI，必须同时带上 FACTORY、SET。</span>
    </div>
    <slot />
  </div>
</template>
