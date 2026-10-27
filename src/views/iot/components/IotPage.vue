<script setup name="IotPage">
import { shallowRef, onMounted, onActivated, onDeactivated, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { demoMode, demoScenario, iotEnvironment } from '../service'
import { shanghaiTime } from '../model'
import '../iot.scss'
defineProps({ title: String, subtitle: String, loading: Boolean, updatedAt: Number })
defineEmits(['refresh'])
const route = useRoute(), router = useRouter()
const clock = shallowRef(shanghaiTime())
let timer
function start() { if (!timer) { clock.value = shanghaiTime(); timer = setInterval(() => { clock.value = shanghaiTime() }, 1000) } }
function stop() { clearInterval(timer); timer = null }
onMounted(start); onActivated(start); onDeactivated(stop); onBeforeUnmount(stop)
const links = [{ name: 'iotDashboard', label: '概览' }, { name: 'iotDevices', label: '设备管理' }, { name: 'iotLogs', label: '日志查询' }]
</script>

<template>
  <div class="app-container iot-page">
    <header class="iot-heading">
      <div><div class="iot-eyebrow"><span class="iot-pulse" /> XT IoT · 只读监控 <el-tag size="small" :type="demoMode ? 'warning' : 'success'">{{ demoMode ? '演示数据' : iotEnvironment }}</el-tag></div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>
      <div class="iot-header-actions"><time class="iot-clock">{{ clock }} <small>上海时间</small></time><el-button icon="Refresh" :loading="loading" @click="$emit('refresh')">刷新</el-button></div>
    </header>
    <div class="iot-subnav"><nav aria-label="IoT 导航"><el-button v-for="link in links" :key="link.name" :type="route.name === link.name || (link.name === 'iotDevices' && route.name === 'iotDeviceDetail') ? 'primary' : 'default'" :plain="route.name !== link.name" @click="router.push({ name: link.name })">{{ link.label }}</el-button></nav><div class="iot-demo-controls"><el-switch v-model="demoMode" active-text="演示数据" /><el-select v-if="demoMode" v-model="demoScenario" aria-label="演示场景" style="width: 142px" size="small"><el-option value="normal" label="正常数据" /><el-option value="empty" label="空数据" /><el-option value="error" label="服务异常 5000" /><el-option value="401" label="鉴权失败 401" /><el-option value="4000" label="参数错误 4000" /><el-option value="4044" label="详情不存在" /></el-select></div></div>
    <div class="iot-data-note"><span>{{ demoMode ? '当前为合成数据，不连接真实设备' : '仅读取设备与日志，不提供设备控制' }}</span><span>{{ updatedAt ? '更新于 ' + shanghaiTime(updatedAt) : '等待数据' }}</span></div>
    <slot />
  </div>
</template>
