/**
 * @module timed
 * @submodule timed-components
 * @public
 */
import Component from 'ember-component'
import computed from 'ember-computed-decorators'
import service from 'ember-service/inject'
import Ember from 'ember'
import hbs from 'htmlbars-inline-precompile'
import { later } from 'ember-runloop'

const { testing, isBlank } = Ember

const SELECTED_TEMPLATE = hbs`{{selected.name}}`

const OPTION_TEMPLATE = hbs`
  <div
    title="{{option.name}}{{if option.archived ' (archived)'}}"
    class="{{if option.archived 'inactive'}}"
  >
    {{option.name}}
    {{#if option.archived}}
      <i class="fa fa-archive"></i>
    {{/if}}
  </div>
`

const CUSTOMER_OPTION_TEMPLATE = hbs`
  <div
    class="{{if option.archived 'inactive'}}"
    title="{{if option.isTask option.longName option.name}}{{if option.archived ' (archived)'}}"
  >
    {{#if option.isTask}}
      <span class="history">
        <i class="fa fa-history"></i>
        <span class="history-text">
          <small>{{option.project.customer.name}}</small>
          {{option.project.name}} > {{option.name}}
        </span>
      </span>
    {{else}}
      {{option.name}}
    {{/if}}
    {{#if option.archived}}
      <i class="fa fa-archive"></i>
    {{/if}}
  </div>
`

/**
 * Component for selecting a task, which consists of selecting a customer and
 * project first.
 *
 * @class TaskSelectionComponent
 * @extends Ember.Component
 * @public
 */
export default Component.extend({
  /**
   * The store service
   *
   * @property {Ember.Store} store
   * @public
   */
  store: service('store'),

  tracking: service('tracking'),

  /**
   * HTML tag name for the component
   *
   * This is an empty string, so we don't have an element of this component in
   * the DOM
   *
   * @property {String} tagName
   * @public
   */
  tagName: '',

  /**
   * Init hook, set initial values if given
   *
   * @method init
   * @public
   */
  didReceiveAttrs() {
    this._super(...arguments)

    let { customer, project, task } = this.getWithDefault('initial', {
      customer: null,
      project: null,
      task: null
    })

    if (!this.get('tracking.customers.last') && !testing) {
      this.get('tracking.customers').perform()
    }

    if (!this.get('tracking.recentTasks.last') && !testing) {
      this.get('tracking.recentTasks').perform()
    }

    if (task && !this.get('task')) {
      return this.set('task', task)
    }

    if (project && !this.get('project')) {
      return this.set('project', project)
    }

    if (customer && !this.get('customer')) {
      return this.set('customer', customer)
    }
  },

  /**
   * Whether to show archived customers, projects or tasks
   *
   * @property {Boolean} archived
   * @public
   */
  archived: false,

  /**
   * Template for displaying the options
   *
   * @property {*} optionTemplate
   * @public
   */
  optionTemplate: OPTION_TEMPLATE,

  /**
   * Template for displaying the customer options
   *
   * @property {*} customerOptionTemplate
   * @public
   */
  customerOptionTemplate: CUSTOMER_OPTION_TEMPLATE,

  /**
   * Template for displaying the selected option
   *
   * @property {*} selectedTemplate
   * @public
   */
  selectedTemplate: SELECTED_TEMPLATE,

  /**
   * The manually selected customer
   *
   * @property {Customer} _customer
   * @private
   */
  _customer: null,

  /**
   * The manually selected project
   *
   * @property {Project} _project
   * @private
   */
  _project: null,

  /**
   * The manually selected task
   *
   * @property {Task} _task
   * @private
   */
  _task: null,

  /**
   * Whether to show history entries in the customer selection or not
   *
   * @property {Boolean} history
   * @public
   */
  history: true,

  /**
   * The selected customer
   *
   * This can be selected manually or automatically, because a task is already
   * set.
   *
   * @property {Customer} customer
   * @public
   */
  @computed('_customer')
  customer: {
    get(customer) {
      return customer
    },
    set(value) {
      // It is also possible a task was selected from the history.
      if (value && value.get('constructor.modelName') === 'task') {
        this.set('task', value)

        return value.get('project.customer')
      }

      this.set('_customer', value)

      /* istanbul ignore else */
      if (
        this.get('project') &&
        (!value || value.get('id') !== this.get('project.customer.id'))
      ) {
        this.set('project', null)
      }

      later(this, () => {
        this.getWithDefault('attrs.on-set-customer', () => {})(value)
      })

      return value
    }
  },

  /**
   * The selected project
   *
   * This can be selected manually or automatically, because a task is already
   * set.
   *
   * @property {Project} project
   * @public
   */
  @computed('_project')
  project: {
    get(project) {
      return project
    },
    set(value) {
      this.set('_project', value)

      if (value && value.get('customer')) {
        this.set('_customer', value.get('customer'))
      }

      /* istanbul ignore else */
      if (
        this.get('task') &&
        (value === null || value.get('id') !== this.get('task.project.id'))
      ) {
        this.set('task', null)
      }

      later(this, () => {
        this.getWithDefault('attrs.on-set-project', () => {})(value)
      })

      return value
    }
  },

  /**
   * The currently selected task
   *
   * @property {Task} task
   * @public
   */
  @computed('_task')
  task: {
    get(task) {
      return task
    },
    set(value) {
      this.set('_task', value)

      if (value && value.get('project')) {
        this.setProperties({
          _project: value.get('project'),
          _customer: value.get('project.customer')
        })
      }

      later(this, () => {
        this.getWithDefault('attrs.on-set-task', () => {})(value)
      })

      return value
    }
  },

  /**
   * All customers and recent tasks which are selectable in the dropdown
   *
   * @property {Array} customersAndRecentTasks
   * @public
   */
  @computed('history', 'archived')
  async customersAndRecentTasks(history, archived) {
    try {
      await this.get('tracking.customers.last')

      let ids = history
        ? await this.get('tracking.recentTasks.last.value').mapBy('id')
        : []

      let customers = this.get('store')
        .peekAll('customer')
        .filter(c => {
          return archived ? true : !c.get('archived')
        })
        .sortBy('name')

      let tasks = this.get('store').peekAll('task').filter(t => {
        return (
          ids.includes(t.get('id')) && (archived ? true : !t.get('archived'))
        )
      })

      return [...tasks.toArray(), ...customers.toArray()]
    } catch (e) {
      return []
    }
  },

  /**
   * All projects which are selectable in the dropdown
   *
   * Those depend on the selected customer
   *
   * @property {Project[]} projects
   * @public
   */
  @computed('customer.id', 'archived')
  async projects(id, archived) {
    try {
      if (!id) {
        throw new Error('Customer must be set to filter projects')
      }

      await this.get('tracking.projects').perform(id)

      return this.get('store')
        .peekAll('project')
        .filter(p => {
          return (
            p.get('customer.id') === id &&
            (archived ? true : !p.get('archived'))
          )
        })
        .sortBy('name')
    } catch (e) {
      return []
    }
  },

  /**
   * All tasks which are selectable in the dropdown
   *
   * Those depend on the selected project
   *
   * @property {Task[]} tasks
   * @public
   */
  @computed('project.id', 'archived')
  async tasks(id, archived) {
    try {
      if (!id) {
        throw new Error('Project must be set to filter tasks')
      }

      await this.get('tracking.tasks').perform(id)

      return this.get('store')
        .peekAll('task')
        .filter(t => {
          return (
            t.get('project.id') === id && (archived ? true : !t.get('archived'))
          )
        })
        .sortBy('name')
    } catch (e) {
      return []
    }
  },

  _focusComesFromOutside(e) {
    let blurredEl = e.relatedTarget
    if (isBlank(blurredEl)) {
      return false
    }
    return !blurredEl.classList.contains('ember-power-select-search-input')
  },

  actions: {
    handleFocus(select, e) {
      if (this._focusComesFromOutside(e)) {
        select.actions.open()
      }
    },

    handleBlur(select, e) {
      if (this._focusComesFromOutside(e)) {
        select.actions.close()
      }
    },

    clear() {
      this.setProperties({
        customer: null,
        project: null,
        task: null
      })
    }
  }
})
