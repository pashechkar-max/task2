
Vue.component('note-card',{
    props: {
        card: Object,
        locked: Boolean,
        done: Boolean,
    },
    methods:{
        toggle(){
            if (this.locked || this.done) return
            this.$emit('update')
        },
        resetItems() {
            if (this.locked || this.done) return
            this.card.items.forEach(item => item.done = false)
            this.card.finishedAt = null
            this.$emit('update')
        }
    },
    template: `
    <div class="card">
        <h3>{{ card.title }}</h3>
        <ul>
            <li v-for="(item, index) in card.items" :key="index">
                <label>
                    <input type="checkbox"
                        :disabled="locked || done"
                        v-model="item.done"
                        @change="toggle(item)">
                    {{ item.text }}
                </label>
            </li>
        </ul>

        <button
            v-if="!done"
            @click="resetItems">
            Сбросить пункты
        </button>
        <small v-if="card.finishedAt">
            Завершено: {{ card.finishedAt }}
        </small>
    </div>
    `
})

new Vue({
    el: '#app',
    data: {
        columns: {
            todo: [{
                id: 1,
                title: 'Первая карточка',
                items: [
                { text: 'Пункт 1', done: false },
                { text: 'Пункт 2', done: false },
                { text: 'Пункт 3', done: false },
                { text: 'Пункт 3', done: false },
                { text: 'Пункт 3', done: false },
                ],
                finishedAt: null
            }],
            progress: [],
            done: []
        }
    },
    computed: {
        isTodoLocked() {
            return this.columns.progress.length >= 5
        },

    },
    methods: {
        updateCard(){
            this.moveCards();
            this.save();
        },
        moveCards(){
            this.columns.todo = this.columns.todo.filter(card => {
                const progress = this.getProgress(card)
                if (progress > 0.5){
                    if(this.columns.progress.length < 5){
                        this.columns.progress.push(card)
                        return false
                    }
                }
                return true
            })

            this.columns.progress = this.columns.progress.filter(card => {
                const progress = this.getProgress(card)
                if (progress === 1){
                    card.finishedAt = new Date().toLocaleDateString()
                    this.columns.done.push(card)
                    return false
                }
                return true
            })
        },
        getProgress(card) {
            const done =card.items.filter(i => i.done).length;
            return done / card.items.length
        },
        save(){
            localStorage.setItem('notes', JSON.stringify(this.columns))
        },
        load(){
            const data = localStorage.getItem('notes');
            if(data){
                this.columns =JSON.parse(data);
            }
        }
    },

    mounted(){
        this.load();
    }
})