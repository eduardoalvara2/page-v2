<template>
  <div class="picture-of-me-container">
    <img  src="../assets/images/me.jpg" class="picture-of-me" />
    <div class="square"></div>
  </div>
</template>
<script>
  /* Author: Eduardo Alvarado 
  * Date: 2023-03-24
  * Description: This component is used to animate images
  */
  export default {
    name: 'PictureOfMe',
    props: {
    },
  }
</script>
<style scoped>
  .picture-of-me-container{
    position: relative;
  }
  img{
    -webkit-filter: grayscale(90%); /* Safari 6.0 - 9.0 */
    filter: grayscale(90%);
    transition: all 0.5s ease;
    z-index: 2;
  }
  img:hover{
    -webkit-filter: grayscale(0%); /* Safari 6.0 - 9.0 */
    filter: grayscale(0%);
    opacity: 1;
  }
  .square{
    position: absolute;
    top: 0;
    left: 0;
    width: 288px;
    height: 288px;
    background-color: var(--primary-color);;
    z-index: -1;
    --picture-of-me-offset: 10px;
    top: var(--picture-of-me-offset);
    left: var(--picture-of-me-offset);
    transition: all 0.5s ease;
  }
  .picture-of-me-container:hover .square{
    --picture-of-me-offset-active: 5px;
    top: var(--picture-of-me-offset-active);
    left: var(--picture-of-me-offset-active);
  }

</style>