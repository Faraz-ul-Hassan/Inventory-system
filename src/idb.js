import { openDB } from "idb";

export const dbPromise = openDB('inventoryDB', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
            db.createObjectStore('products', {keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('customers')) {
            db.createObjectStore('customers', {keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('invoices')) {
            db.createObjectStore('invoices', {keyPath: 'id', autoIncrement: true });
        }
    },
});

// ----Products----
export async function addProduct(product) {
  const db = await dbPromise;
  await db.add('products', product);
}
export async function getAllProducts() {
  const db = await dbPromise;
  return await db.getAll('products');
}
export async function deleteProduct(id) {
  const db = await dbPromise;
  await db.delete('products', id);
}

// ----Customers----
export async function addCustomer(customer) {
  const db = await dbPromise;
  await db.add('customers', customer);
}
export async function getAllCustomers() {
  const db = await dbPromise;
  return await db.getAll('customers');
}
export async function deleteCustomer(id) {
  const db = await dbPromise;
  await db.delete('customers', id);
}

// ---------- INVOICES ----------
export async function addInvoice(invoice) {
  const db = await dbPromise;
  await db.add('invoices', invoice);
}
export async function getAllInvoices() {
  const db = await dbPromise;
  return await db.getAll('invoices');
}
export async function deleteInvoice(id) {
  const db = await dbPromise;
  await db.delete('invoices', id);
}









