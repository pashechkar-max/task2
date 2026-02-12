Vue.component('note-card', {
    props: {
        card: Object,
        disabled: Boolean,
        priorityLocked: Boolean
    },
    methods: {
        onChange() {
            if (!this.disabled && !this.priorityLocked) {
                this.$emit('update')
            }
        },
        togglePriority() {
            if (this.priorityLocked) return
            this.$emit('priority', this.card)
        }
    },
    template: `
    <div class="card">
      <h3>{{ card.title }}
            <button class="priority"
            v-if="!card.finishedAt"
            @click="togglePriority"
            :disabled="priorityLocked"
        >
    create priority
  </button>
      </h3>
      <ul>
        <li v-for="(item, i) in card.items" :key="i">
          <label>
          <input
              type="checkbox"
              v-model="item.done"
              :disabled="disabled || priorityLocked"
              @change="onChange"
            />
            {{ item.text }}
          </label>
        </li>
      </ul>

      <small v-if="card.finishedAt">
        Completed: {{ card.finishedAt }}
      </small>
    </div>
  `
})

Vue.component('create-card', {
    data() {
        return {
            title: '',
            items: [
                { text: '' },
                { text: '' },
                { text: '' }
            ]
        }
    },

    computed: {
        canCreate() {
            if (!this.title.trim()) return false

            const filled = this.items.filter(i => i.text.trim())
            return filled.length >= 3 && filled.length <= 5
        }
    },

    methods: {
        addItem() {
            if (this.items.length < 5) {
                this.items.push({ text: '' })
            }
        },

        create() {
            if (!this.canCreate) return

            const card = {
                id: Date.now(),
                title: this.title.trim(),
                items: this.items
                    .filter(i => i.text.trim())
                    .map(i => ({
                        text: i.text.trim(),
                        done: false
                    })),
                finishedAt: null,
                isPriority: false
            }

            this.$emit('create', card)
            this.reset()
        },

        reset() {
            this.title = ''
            this.items = [
                { text: '' },
                { text: '' },
                { text: '' }
            ]
        }
    },

    template: `
      <div class="create-card">
        <input v-model="title" placeholder="title">

        <div v-for="(item, i) in items" :key="i">
          <input v-model="item.text" placeholder="item">
        </div>

        <button class="item" @click="addItem" :disabled="items.length >= 5">
          + Item
        </button>

        <button class="create" @click="create" :disabled="!canCreate">
          Create
        </button>
      </div>
    `
})

Vue.component('board-column', {
    props: {
        title: String,
        cards: Array,
        disabled: Boolean,
        priorityLocked: Boolean,
        isDoneColumn: Boolean
    },
    methods: {
        clear() {
            this.$emit('clear')
        }
    },
    template: `
    <div class="column">
        <h2>{{ title }}</h2>
        <note-card
            v-for="card in cards"
            :key="card.id"
            :card="card"
            :disabled="disabled"
            :priorityLocked="priorityLocked && !card.isPriority"
            @update="$emit('update')"
            @priority="$emit('priority', $event)"
        ></note-card>


        <button v-if="isDoneColumn" @click="clear" :disabled="!cards.length">
            Clear Done
        </button>
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
            const hasOverHalf = this.columns.todo.some(card => this.progress(card) > 0.5)
            return this.columns.progress.length >= 5 && hasOverHalf
        },
        hasActivePriority() {
            const all = [
                ...this.columns.todo,
                ...this.columns.progress
            ]
            return all.some(card => card.isPriority)
        }
    },

    methods: {
        setPriority(card) {
            if (this.hasActivePriority && !card.isPriority) return

            [...this.columns.todo, ...this.columns.progress].forEach(c => {
                c.isPriority = false
            })

            card.isPriority = true
            this.save()
        },

        addCard(card) {
            if (this.columns.todo.length >= 3) {
                return alert("No more than three notes")
            }
            this.columns.todo.push(card)
            this.save()
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

                if (p > 0.5 && !this.columns.progress.includes(card)) {
                    if (this.columns.progress.length < 5) {
                        this.columns.progress.push(card)
                        return false
                    }
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
            if (!card.finishedAt) {
                card.finishedAt = new Date().toLocaleString()
            }
            card.isPriority = false
        },

        save() {
            localStorage.setItem('notes', JSON.stringify(this.columns))
        },

        load() {
            const data = localStorage.getItem('notes')
            if (data) {
                const parsed = JSON.parse(data)
                this.columns.todo = parsed.todo || []
                this.columns.progress = parsed.progress || []
                this.columns.done = parsed.done || []
            }
        },

        clearDone() {
            if (!confirm('Clear all completed cards?')) return
            this.columns.done = []
            this.save()
        }
    },

    mounted() {
        this.load()
    }
})

