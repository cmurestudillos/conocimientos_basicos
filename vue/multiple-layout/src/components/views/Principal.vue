<template>
  <v-container>
     <v-jumbotron color="grey lighten-2">
        <v-container fill-height>
        <v-layout align-center>
            <v-flex>
            <h3 class="display-3">Esto es una vista con layout principal y ejemplo de Login</h3>
            <v-divider class="my-3"></v-divider>
            <v-btn @click="$router.push('/')" large color="primary" class="mx-0">Volver al login</v-btn>
            </v-flex>
        </v-layout>
        </v-container>
    </v-jumbotron>
  </v-container>
</template>
<script>
    export default {
        created () {
            this.$store.commit('SET_LAYOUT', 'principal-layout')
        }
    }
</script>