<template>
  <div class="top-nav-box">
    <div class="logo">
      <img :src="logoMini" alt="logo" />
    </div>
    <div class="nav-box">
      <ul class="nav">
        <li
          v-for="(item, index) in navList"
          :key="item.id"
          :class="clickedIndex === index ? 'clickedNav' : ''"
          @click="navClick(item.id, index)"
        >
          {{ item.systemName }}
        </li>
      </ul>
      <div class="right">
        <el-dropdown class="avatar-container" trigger="click">
          <div class="avatar-wrapper">
            <img class="user-avatar" :src="userAvatar" alt="avatar" />
            <span class="user-name">{{ username }}</span>
            <el-icon class="caret"><CaretBottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item divided @click="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <i class="right-line" />
        <div class="message-icon-box">
          <svg-icon icon-class="nav-ring" class="color-main" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="TopNav">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { getLeftMenus } from '@/api/login'
import { getCookie } from '@/utils/support'
import logoMini from '@/assets/images/logo.png'
import userAvatar from '@/assets/images/user.png'

const appStore = useAppStore()
const userStore = useUserStore()
const { sidebarTop: navList } = storeToRefs(appStore)

const username = ref(getCookie('trueName') || '')
const clickedIndex = ref(0)

function navClick(menuId, index) {
  clickedIndex.value = index
  getLeftMenus({ parentMenuId: menuId }).then(response => {
    appStore.setSidebarRight(response.retData)
  })
}

// 顶部导航就绪后默认选中第一个系统
watch(
  navList,
  val => {
    if (val && val.length) {
      navClick(val[0].id, 0)
    }
  },
  { immediate: true }
)

function logout() {
  userStore.logOut().then(() => {
    ElMessage({ message: '已退出！', type: 'success', duration: 1000 })
    setTimeout(() => location.reload(), 100)
  })
}
</script>

<style lang="scss" scoped>
.top-nav-box {
  display: flex;
  height: 70px;
  align-items: center;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #3a4354;
  z-index: 99;
}
.logo {
  height: 70px;
  min-width: 240px;
  display: flex;
  align-items: center;
  color: #edf5fb;
  padding: 10px 26px;
  img {
    width: 133px;
    height: auto;
  }
}
.nav-box {
  display: flex;
  flex: 10;
  padding: 0 30px 0 0;
  align-items: center;
  justify-content: space-between;
  .right {
    display: flex;
    align-items: center;
  }
}
.nav {
  display: flex;
  li {
    height: 70px;
    line-height: 70px;
    text-align: center;
    padding: 0 30px;
    color: #edf5fb;
    font-size: 16px;
    cursor: pointer;
  }
  li:hover,
  .clickedNav {
    background-color: #485266;
    color: #edf5fb;
    border-bottom: 4px solid #2274e7;
  }
}
.avatar-container {
  height: 35px;
  .avatar-wrapper {
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #e3eaf4;
    font-size: 16px;
    .user-avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .caret {
      margin-left: 6px;
      font-size: 14px;
    }
  }
}
.right-line {
  width: 1px;
  height: 15px;
  background-color: #dcebf7;
  margin: 0 15px 0 20px;
}
.message-icon-box {
  display: flex;
  align-items: center;
  font-size: 20px;
  color: #fff;
}
.clickedNav {
  background-color: #485266;
  color: #edf5fb;
  border-bottom: 4px solid #2274e7;
}
</style>
