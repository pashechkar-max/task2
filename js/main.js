Vue.component('note-card', {
    props: {
        card: Object,
        disabled: Boolean
    },
    methods: {
        onChange() {
            if (!this.disabled) {
                this.$emit('update')
            }
        }
    },
    template: `
    <div class="card">
      <h3>{{ card.title }}</h3>

      <ul>
        <li v-for="(item, i) in card.items" :key="i">
          <label>
            <input
              type="checkbox"
              v-model="item.done"
              :disabled="disabled"
              @change="onChange"
            >
            {{ item.text }}
          </label>
        </li>
      </ul>

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
            todo: [],
            progress: [],
            done: []
        },
        newCard: {
            title: '',
            items: [
                { text: '', done: false },
                { text: '', done: false },
                { text: '', done: false }
            ]
        }
    },

    computed: {
        todoLocked() {
            return this.columns.progress.length >= 5
        },

        canCreateCard() {
            if (this.columns.todo.length >= 3) return false
            if (!this.newCard.title.trim()) return false

            const filled = this.newCard.items.filter(i => i.text.trim())
            return filled.length >= 3 && filled.length <= 5
        }
    },

    methods: {
        createCard() {
            if (!this.canCreateCard) return

            this.columns.todo.push({
                id: Date.now(),
                title: this.newCard.title.trim(),
                items: this.newCard.items.map(i => ({
                    text: i.text.trim(),
                    done: false
                })),
                finishedAt: null
            })

            this.newCard.title = ''
            this.newCard.items = [
                { text: '', done: false },
                { text: '', done: false },
                { text: '', done: false }
            ]
            this.save()
        },

        addItem() {
            if (this.newCard.items.length < 5) {
                this.newCard.items.push({ text: '', done: false })
            }
        },

        update() {
            this.moveCards()
            this.save()
        },

        moveCards() {
            this.columns.todo = this.columns.todo.filter(card => {
                const p = this.progress(card)
                if (p === 1) {
                    this.finish(card)
                    this.columns.done.push(card)
                    return false
                }
                if (p > 0.5 && this.columns.progress.length < 5) {
                    this.columns.progress.push(card)
                    return false
                }
                return true
            })

            this.columns.progress = this.columns.progress.filter(card => {
                if (this.progress(card) === 1) {
                    this.finish(card)
                    this.columns.done.push(card)
                    return false
                }
                return true
            })
        },

        progress(card) {
            if (!card.items.length) return 0
            return card.items.filter(i => i.done).length / card.items.length
        },

        finish(card) {
            card.finishedAt = new Date().toLocaleString()
        },

        save() {
            localStorage.setItem('notes', JSON.stringify(this.columns))
        },

        load() {
            const data = localStorage.getItem('notes')
            if (data) this.columns = JSON.parse(data)
        }
    },

    mounted() {
        this.load()
    }
})
