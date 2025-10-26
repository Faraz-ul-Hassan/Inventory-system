<script setup>
import { ref, onMounted } from 'vue'
import { addCustomer, getAllCustomers, deleteCustomer } from '../idb'

const name = ref('')
const email = ref('')
const phone = ref('')
const customers = ref([])

async function loadCustomers() {
  customers.value = await getAllCustomers()
}

onMounted(loadCustomers)

async function addCustomerHandler() {
  if (!name.value || !email.value || !phone.value) return
  await addCustomer({
    name: name.value,
    email: email.value,
    phone: phone.value })
  name.value = ''
  email.value = ''
  phone.value = ''
  await loadCustomers()
}

async function deleteCustomerHandler(id) {
  await deleteCustomer(id)
  await loadCustomers()
}
</script>

<template>
  <div class="container mt-4">
    <h3 class="mb-3">Customers</h3>

    <form @submit.prevent="addCustomerHandler" class="mb-3">
      <input v-model="name" class="form-control mb-2" placeholder="Customer Name" />
      <input v-model="email" class="form-control mb-2" placeholder="Email" />
      <input v-model="phone" class="form-control mb-2" placeholder="Phone" />
      <button class="btn btn-success w-100">Add Customer</button>
    </form>

    <ul class="list-group">
      <li
        v-for="c in customers"
        :key="c.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{{ c.name }}</strong>
          <div class="text-muted small">{{ c.email }} | {{ c.phone }}</div>
        </div>
        <button @click="deleteCustomerHandler(c.id)" class="btn btn-danger btn-sm">Delete</button>
      </li>
    </ul>
  </div>
</template>
