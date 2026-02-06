let app = new Vue ({
    el: '#app',

})
Vue.component('card', {
    props: {
        truesh: {
            type: Boolean,
            required: true
        }
    },
    template: `
<div class="card">
    <h1>{{ title }}</h1>
    <div class="card-image">
        <img :src="image" :alt="altText"/>
    </div>
    <div class="card-content">
        <p>Description: {{ allText }}</p>
        <ul>
            <li v-for="categori in categories">{{ categori }}</li>
        </ul>
    </div>
</div>
    `,
    data(){
    return{
        product: "card",
        allText: "softysofty",
        categories: ['qwe', 'asd', 'zxc'],
        selectedVariant: 0,
        variants: [
            {
                variantId: 1,
                variantImage: ".\assets\kusy1.jpg",
            },
            {
                variantId: 2,
                variantImage: ".\assets\kusy2.jpg",
            },
            {
                variantId: 3,
                variantImage: ".\assets\kusy3.jpg",
            },
            {
                variantId: 4,
                variantImage: ".\assets\kusy4.jpg",
            },

        ]
    }
},
    computed:{
        title(){
            return this.product;
        },
        image(){
            return this.variants[this.selectedVariant].variantImage;
        },

    }
})
