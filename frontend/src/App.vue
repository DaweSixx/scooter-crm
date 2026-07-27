<template>
  <div id="app-container">
    <nav class="sidebar">
      <h2>Scooter CRM</h2>
      <ul>
        <li><router-link to="/">Дашборд</router-link></li>
        <li><router-link to="/scooters">Самокаты</router-link></li>
        <li><router-link to="/rentals">Аренды</router-link></li>
      </ul>
    </nav>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style>
body { margin: 0; font-family: 'Inter', sans-serif; background-color: #f8f9fa; color: #333; }
#app-container { display: flex; min-height: 100vh; }
.sidebar { width: 220px; background: #1e293b; color: #fff; padding: 20px; }
.sidebar h2 { font-size: 1.2em; margin-bottom: 24px; }
.sidebar ul { list-style: none; padding: 0; margin: 0; }
.sidebar li { margin-bottom: 12px; }
.sidebar a { color: #94a3b8; text-decoration: none; font-weight: 500; }
.sidebar a.router-link-exact-active { color: #fff; }
.content { flex: 1; padding: 32px; overflow-y: auto; }
</style>