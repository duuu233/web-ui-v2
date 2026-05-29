<template>
  <div class="sidebar-inner">
    <div class="menus-box">
      <template v-for="(item, index) in sidebarRight" :key="index">
        <div
          v-show="hideItemList.indexOf(item.menuName) === -1"
          class="item"
        >
          <div class="title">
            <i class="line" />
            <span class="name">{{ item.menuName }}</span>
          </div>
          <div v-if="item.childs && item.childs.length" class="route-box">
            <template v-for="(v, i) in item.childs" :key="i">
              <div
                v-if="hideSubItemList.indexOf(v.menuName) === -1"
                class="subitem"
              >
                <router-link
                  v-if="v.menuUrl"
                  :to="{ name: v.menuUrl }"
                  :class="{ clickedNav: isActive(v.menuUrl) }"
                >
                  {{ v.menuName }}
                </router-link>
                <span v-else>{{ v.menuName }}</span>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup name="Sidebar">
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
const { sidebarRight } = storeToRefs(appStore)
const route = useRoute()

// 与原项目一致：屏蔽部分尚未启用的菜单
const hideItemList = ['支付查询']
const hideSubItemList = [
  '商品品牌',
  '新闻分类',
  '新闻列表',
  '意见反馈',
  '商品属性值',
  '搜索关键词',
  '基础信息',
  '活动管理',
  '广告位置',
  '用户优惠券列表'
]

function isActive(name) {
  return route.name === name
}
</script>

<style lang="scss" scoped>
.sidebar-inner {
  height: 100%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #99a9bf;
    border-radius: 20px;
  }
}
.menus-box {
  .item {
    padding-bottom: 20px;
    margin-left: 10px;
    padding-left: 10px;
    border-bottom: 1px solid #e2eafa;
  }
  .title {
    display: flex;
    font-size: 14px;
    line-height: 40px;
    color: #333;
    margin-top: 14px;
    font-weight: 600;
    align-items: center;
    position: relative;
    .line {
      width: 4px;
      height: 16px;
      background-color: #2274e7;
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 2px;
    }
  }
  .route-box {
    display: flex;
    font-size: 12px;
    line-height: 30px;
    flex-wrap: wrap;
    color: #555;
    .subitem {
      width: 110px;
      a,
      span {
        display: inline-block;
        border-bottom: 1px solid transparent;
        line-height: 15px;
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      a:hover {
        color: #2274e7;
        border-bottom: 1px solid #2274e7;
      }
    }
  }
}
.clickedNav {
  color: #2274e7 !important;
}
</style>
