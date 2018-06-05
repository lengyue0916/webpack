<template>
  <footer class="footer">
     <div>
     	<section　v-for="item in list" class="tabbar">
     		<router-link :to="item.link" class="link">
	     		<span><img :src="item.imgUrl" /></span>
	     		<span>{{item.name}}</span>
     	    </router-link>
     	</section>
     </div>
  </footer>
</template>
<script>
 import index from '../img/index.png'
 import people from '../img/people.png'
 import me from  '../img/me.png'
 export default {
 data () {
    return {
      list: [{
      	 link:'/index',
         imgUrl:index,
         name:'发现'
      },{
      	 link:'/detail',
　　　　　　　　　imgUrl:people,
         name:'旅居'
      },{
      	 link:'/detail',
　　　　　　　　　imgUrl:me,
         name:'我的'
      }]
    }
  },
  created () {
    
  },
  methods: {

  }
}
</script>