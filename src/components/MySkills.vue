<template>
    <div class="tabs-container" ref="tabsContainer">
        <div class="square" ref="square">
        </div>
        <div class="tabs">
            <div class="tab">
                <button ref="tab1" v-on:click="activateTab(1)">
                    Tech Skills
                </button>
            </div>  
            <div class="tab">
                <button ref="tab2" v-on:click="activateTab(2)">
                    General Skills
                </button>
            </div>
        </div>
        <div class="tabs-content" :style="{height: tabsContentHeight + 'px'}">
            <div ref="tabContent1" class="tab-content">
                <p>
                    <ul>
                        <li>Programming languages: <b>JavaScript</b>, <b>PHP</b>, <b>SQL</b>, <b>CSS/SASS</b>, Python, C# (Unity).</li>
                        <li>Frameworks and libraries: Laravel, Vue, Leaflet, Handsontable, DataTables, ThreeJs, PaperJs, BillboardJs, jQuery, Bootstrap, among others.</li>
                        <li>Databases: MySQL/MariaDB, PostgreSQL (with PostGIS), MongoDB, SQLite.</li>
                        <li>Development tools: Git, Composer, NPM, Webpack, GeoServer, GPT, Copilot, Unity, among others</li>
                    </ul>
                </p>
            </div>
            <div ref="tabContent2" class="tab-content">
                <p>
                    <ul>
                        <li>Organization and planning skills: Time management, prioritization, task tracking.</li>
                        <li>Problem-solving: Analytical thinking, bug fixing, debugging, lateral thinking.</li>
                        <li>Team collaboration: Effective communication, teamwork, enthusiastic.</li>
                        <li>Project management: Jira, Scrum, Trello.</li>
                    </ul>
                </p>
            </div>
        </div>
    </div>

</template>
<script>
import { nextTick } from 'vue';
/* Author: Eduardo Alvarado 
* Date: 2023-03-24
* Description: This component is used to show my skills
*/
export default {
    name: 'MySkills',
    data(){
        return {
            activeTab: 1,
            tabsContentHeight: 0
        }
    },
    watch: {
        activeTab: function(){
            this.animateActivateTab();
            this.animateActivateTabContent();
            this.updateTabsContentHeight();
        }
    },
    mounted(){
        this.animateActivateTab();
        this.animateActivateTabContent();
        this.updateTabsContentHeight();
        window.addEventListener('resize', () => {
            this.animateActivateTab();
        });
    },
    methods: {
        activateTab(n){
            this.activeTab = n;
        },
        animateActivateTab(){
            const el = this.$refs['tab' + this.activeTab];
            // Get the position of the tab container
            const tabsContainer = this.$refs.tabsContainer.getBoundingClientRect().left;
            this.$refs.square.style.left = el.getBoundingClientRect().left - tabsContainer + 'px';
            this.$refs.square.style.width = el.getBoundingClientRect().width + 'px';
        },
        animateActivateTabContent(){
            const tabContentEl = this.$refs['tabContent' + this.activeTab];

            document.querySelectorAll('.tab-content').forEach(el => {
                if(el == tabContentEl) return;
                el.style.opacity = 0;
                setTimeout(() => {
                    el.style.display = 'none';
                }, 300);
            });

            tabContentEl.style.display = 'block';
            nextTick(() => {
                tabContentEl.style.opacity = 1;
            });

        },
        updateTabsContentHeight(){
            this.tabsContentHeight = this.$refs['tabContent' + this.activeTab].getBoundingClientRect().height;
        }
    }
}
</script>
<style scoped lang="scss">
  @import '../assets/scss/mixins.scss';

    .tabs, .tabs-content{
        width: 100%;
        padding: 0 10%;
    }
    .tabs{
        display: flex;
        justify-content: space-between;
        .tab {
            flex: 1;
            position: relative;
            button{
                cursor: pointer;
                width: 100%;
                background: transparent;
                border: none;
                color: white;
            }
        }
    }
    .tabs-container{
        position: relative;
    }
    .tabs-content{
        margin-top: 2rem;
        position: relative;
    }
    .tab-content{
        transition: all 0.3s ease-in-out;
        opacity: 0;
        display: none;
        position: absolute;
        @include mobile {
            left: 0;
        }
    }
    .square{
        position: absolute;
        top: 25px;
        left: 0;
        width: 0;
        height: 2px;
        background-color: var(--primary-color);
        z-index: -1;
        --picture-of-me-offset: 10px;
        transition: all 0.15s ease-in-out;
    }
    ul{
        list-style: none;
    }
    li{
        margin-bottom: 15px;
    }
    li::before{
        content: "▹";
        position: absolute;
        left: 0px;
        color: var(--primary-color);
    }
</style>