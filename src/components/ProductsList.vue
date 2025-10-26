<script setup>
import { ref, onMounted } from 'vue'
import { addProduct, getAllProducts, deleteProduct } from '../idb'

const name = ref('')
const price = ref('')
const quantity = ref('')
const products = ref([])

async function loadProducts() {
  products.value = await getAllProducts()
}

onMounted(loadProducts)

async function addProductHandler() {
  if (!name.value || !price.value || !quantity.value) return
  await addProduct({
    name: name.value,
    price: price.value,
    quantity: quantity.value
  })
  name.value = ''
  price.value = ''
  quantity.value = ''
  await loadProducts()
}

async function deleteProductHandler(id) {
  await deleteProduct(id)
  await loadProducts()
}
</script>

<template>
  <div class="container mt-4">
    <h3 class="mb-3">Products</h3>

    <form @submit.prevent="addProductHandler" class="mb-3">
      <input v-model="name" class="form-control mb-2" placeholder="Product name" />
      <input v-model.number="price" class="form-control mb-2" placeholder="Price" />
      <input v-model.number="quantity" class="form-control mb-2" placeholder="Quantity" />
      <button class="btn btn-success w-100">Add Product</button>
    </form>

    <ul class="list-group">
      <li v-for="p in products" :key="p.id" class="list-group-item d-flex justify-content-between">
        {{ p.name }} - {{ p.price }} PKR (x{{ p.quantity }})
        <button @click="deleteProductHandler(p.id)" class="btn btn-danger btn-sm">Delete</button>
      </li>
    </ul>
  </div>
</template>

