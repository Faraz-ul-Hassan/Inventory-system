<template>
  <div>
    <nav class="navbar navbar-dark bg-dark px-3">
      <a class="navbar-brand" href="#">Inventory System</a>
      <div>
        <button @click="current='products'" class="btn btn-outline-light me-2">Products</button>
        <button @click="current='customers'" class="btn btn-outline-light me-2">Customers</button>
        <button @click="current='invoices'" class="btn btn-outline-light">Invoices</button>
      </div>
    </nav>

    <div v-if="current === 'products'"><Products /></div>
    <div v-else-if="current === 'customers'"><Customers /></div>
    <div v-else><Invoices /></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Products from './components/ProductsList.vue'
import Customers from './components/CustomersList.vue'
import Invoices from './components/InvoicesList.vue'

const current = ref('products')
</script>
