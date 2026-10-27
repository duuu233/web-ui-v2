<script setup name="IotShadow">
import { computed } from 'vue'
import IotValue from './IotValue.vue'
import { shadowGroups, otherShadowEntries, valueText, shanghaiTime } from '../model'
const props = defineProps({ shadow: { type: Object, default: () => ({}) } })
const groups = computed(() => shadowGroups.map(group => ({ ...group, entries: group.fields.filter(([key]) => Object.hasOwn(props.shadow, key)) })).filter(group => group.entries.length))
const others = computed(() => otherShadowEntries(props.shadow))
const hasShadow = computed(() => Object.keys(props.shadow).length > 0)
function text(key, value) { return /At$/.test(key) ? shanghaiTime(value) : valueText(value) }
</script>
<template>
  <el-empty v-if="!hasShadow" description="设备尚未上报影子数据" :image-size="70" />
  <template v-else><div class="iot-shadow-groups"><section v-for="group in groups" :key="group.title" class="iot-shadow-group"><h3>{{ group.title }}</h3><dl><template v-for="[key, label] in group.entries" :key="key"><dt>{{ label }}</dt><dd><IotValue v-if="['battery', 'wifiRssi', 'tfStatus'].includes(key)" :kind="key" :value="shadow[key]" /><span v-else>{{ text(key, shadow[key]) }}</span></dd></template></dl></section></div><section v-if="others.length" class="iot-shadow-other"><h3>其他字段</h3><dl><template v-for="[key, value] in others" :key="key"><dt class="iot-mono">{{ key }}</dt><dd class="iot-mono">{{ valueText(value) }}</dd></template></dl></section></template>
</template>
