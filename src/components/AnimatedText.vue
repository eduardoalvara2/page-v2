<template>
    <span class="animated-text">
        <span v-for="letter in letters" :key="letter">
            <span v-html="letter" ></span>
        </span>
    </span>
</template>
<script>
  /* Author: Eduardo Alvarado 
  * Date: 2023-02-15
  * Description: This component is used to animate text
  *              in the landing page.
  */
  export default {
    name: 'AnimatedText',
    props: {
      text: String,
      show: Boolean,
      wrap: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        letters: [],
        alreadyAnimated: false
      }
    },
    watch: {
      show: function (val) {
        if(val){
          this.animateText();
        } else {
          this.removeText();
        }
      }
    },
    created () {
      this.letters = this.text
        .split('')
        .map( l => l === ' ' ? '&nbsp;' : l );
    },
    mounted(){
      this.removeText();
      if(this.wrap){
        this.$el.classList.add('wrap');
      }
      this.handleScroll();
      window.addEventListener('scroll',  () => {
          this.handleScroll();
      });
    },
    methods:{
      handleScroll(){
        const el = this.$el;
        const elTop = el.getBoundingClientRect().top;
        const elBottom = el.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        if(elTop < windowHeight && elBottom > 0){
          this.animateText();
        }
      },
      animateText(){
        this.$el.querySelectorAll('.animated-text > span.hide').forEach( (span, i) => {
          setTimeout(() => {
            span.classList.add('active');
            setTimeout(() => {
              span.classList.remove('active');
              span.classList.remove('hide');
            }, 150);
          }, i * 50);
        });
        this.$el.classList.remove('hide');
      },
      removeText(){
        this.$el.classList.add('hide');
        this.$el.querySelectorAll('.animated-text > span').forEach( (span) => {
          span.classList.remove('active');
          span.classList.add('hide');
        });
      }
    }
  }
</script>
<style>
  .animated-text {
    display: inline;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    transition: all 0.3s ease;
    opacity: 1;
  }
  .animated-text.wrap {
    white-space: normal;
  }
  .animated-text > span > span{
    display: inline-block;
    position: relative;
    transform: translate3d(0, 0, 0);
    transition: all 0.3s ease;
    opacity: 1;
  }
  .animated-text > span.active > span,
  .animated-text > span:hover > span {
    transform: translate3d(0, -20%, 0);
  }
  .animated-text > span.active + span > span,
  .animated-text > span:hover + span > span  {
    transform: translate3d(0, -10%, 0);
  }
  
  .animated-text > span.hide > span{
    opacity: 0;
  }
  
  .animated-text.hide{
    opacity: 0;
  }

</style>