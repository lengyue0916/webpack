import Vue from 'vue'
import Router from 'vue-router'
import index from '@/page/index/index'

Vue.use(Router)

export default new Router({
 routes: [
     {
        path: '',
        redirect: '/index'
     },{
      path: '/index',
      component: index
    }
  ]
})
