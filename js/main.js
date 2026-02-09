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
        }
    },

    computed: {
        todoLocked() {
            return this.columns.progress.length >= 5
        }
    },

    methods: {
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

        if (!this.columns.todo.length) {
            this.columns.todo.push({
                id: 1,
                title: 'Первая карточка',
                items: [
                    { text: 'Пункт 1', done: false },
                    { text: 'Пункт 2', done: false },
                    { text: 'Пункт 3', done: false }
                ],
                finishedAt: null
            })
        }
    }
})
