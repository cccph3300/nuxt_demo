<template>
  <div>
    <UPageHero
      title="用户管理系统"
      description="基于Nuxt.js和MySQL的全栈用户管理示例"
      :links="[{
        label: '查看文档',
        to: 'https://ui.nuxt.com/docs/getting-started/installation/nuxt',
        target: '_blank',
        trailingIcon: 'i-lucide-arrow-right',
        size: 'xl'
      }]"
    />

    <!-- 用户管理区域 -->
    <UPageSection
      id="user-management"
      title="用户管理"
      description="添加和管理用户信息"
    >
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 添加用户表单 -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-user-plus"
                class="w-5 h-5"
              />
              <span>添加新用户</span>
            </div>
          </template>

          <UForm
            :state="newUser"
            class="space-y-4"
            @submit="addUser"
          >
            <UFormGroup
              label="姓名"
              name="name"
              required
            >
              <UInput
                v-model="newUser.name"
                placeholder="请输入姓名"
              />
            </UFormGroup>

            <UFormGroup
              label="邮箱"
              name="email"
              required
            >
              <UInput
                v-model="newUser.email"
                type="email"
                placeholder="请输入邮箱地址"
              />
            </UFormGroup>

            <UButton
              type="submit"
              :loading="addingUser"
              :disabled="!newUser.name || !newUser.email"
            >
              <UIcon
                name="i-lucide-save"
                class="w-4 h-4"
              />
              添加用户
            </UButton>
          </UForm>
        </UCard>

        <!-- 用户列表 -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-users"
                  class="w-5 h-5"
                />
                <span>用户列表 ({{ users.length }})</span>
              </div>
              <UButton
                variant="outline"
                :loading="loading"
                icon="i-lucide-refresh-cw"
                @click="loadUsers"
              >
                刷新
              </UButton>
            </div>
          </template>

          <div
            v-if="loading"
            class="text-center py-8"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="w-8 h-8 animate-spin text-primary-500"
            />
            <p class="mt-2 text-gray-500">
              加载中...
            </p>
          </div>

          <div
            v-else-if="users.length === 0"
            class="text-center py-8"
          >
            <UIcon
              name="i-lucide-users"
              class="w-12 h-12 text-gray-300 mx-auto"
            />
            <p class="mt-2 text-gray-500">
              暂无用户数据
            </p>
            <UButton
              variant="outline"
              class="mt-4"
              @click="initializeDatabase"
            >
              初始化数据库
            </UButton>
          </div>

          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="user in users"
              :key="user.id"
              class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <p class="font-medium">
                  {{ user.name }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ user.email }}
                </p>
                <p class="text-xs text-gray-400">
                  创建时间: {{ formatDate(user.created_at) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                  ID: {{ user.id }}
                </span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UPageSection>

    <!-- 系统信息 -->
    <UPageSection
      id="system-info"
      title="系统信息"
      description="当前系统配置和状态"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-database"
                class="w-5 h-5"
              />
              <span>数据库状态</span>
            </div>
          </template>
          <div class="text-center">
            <p class="text-2xl font-bold text-primary-600">
              {{ users.length }}
            </p>
            <p class="text-gray-500">
              用户数量
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-server"
                class="w-5 h-5"
              />
              <span>后端API</span>
            </div>
          </template>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-500">用户列表</span>
              <UBadge color="success">
                /api/users
              </UBadge>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">添加用户</span>
              <UBadge color="primary">
                /api/users
              </UBadge>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">初始化</span>
              <UBadge color="warning">
                /api/init
              </UBadge>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-settings"
                class="w-5 h-5"
              />
              <span>技术栈</span>
            </div>
          </template>
          <div class="space-y-2">
            <UBadge color="success">
              Nuxt.js 4
            </UBadge>
            <UBadge color="primary">
              Vue 3
            </UBadge>
            <UBadge color="secondary">
              TypeScript
            </UBadge>
            <UBadge color="warning">
              MySQL
            </UBadge>
            <UBadge color="info">
              Tailwind CSS
            </UBadge>
          </div>
        </UCard>
      </div>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  created_at: string
}

const newUser = ref({
  name: '',
  email: ''
})

const users = ref<User[]>([])
const loading = ref(false)
const addingUser = ref(false)

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/users') as { success: boolean, data: User[] }
    if (response?.success) {
      users.value = response.data || []
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 添加用户
const addUser = async () => {
  addingUser.value = true
  try {
    const response = await $fetch('/api/users', {
      method: 'POST',
      body: newUser.value
    }) as { success: boolean, data?: { id: number }, message?: string }

    if (response?.success) {
      // 清空表单
      newUser.value = { name: '', email: '' }
      // 重新加载用户列表
      await loadUsers()

      // 显示成功消息
      useToast().add({
        title: '成功',
        description: '用户添加成功',
        icon: 'i-lucide-check-circle',
        color: 'success'
      })
    }
  } catch (error: unknown) {
    console.error('添加用户失败:', error)

    const errorMessage = (error as { data?: { message?: string } }).data?.message || '添加用户失败'

    useToast().add({
      title: '错误',
      description: errorMessage,
      icon: 'i-lucide-x-circle',
      color: 'error'
    })
  } finally {
    addingUser.value = false
  }
}

// 初始化数据库
const initializeDatabase = async () => {
  try {
    const response = await $fetch('/api/init', {
      method: 'POST'
    }) as { success: boolean, message: string }

    if (response?.success) {
      await loadUsers()

      useToast().add({
        title: '成功',
        description: '数据库初始化成功',
        icon: 'i-lucide-check-circle',
        color: 'success'
      })
    }
  } catch (error) {
    console.error('初始化数据库失败:', error)

    useToast().add({
      title: '错误',
      description: '初始化数据库失败',
      icon: 'i-lucide-x-circle',
      color: 'error'
    })
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 页面加载时获取用户列表
onMounted(() => {
  loadUsers()
})
</script>
