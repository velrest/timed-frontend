/**
 * @module timed
 * @submodule timed-components
 * @public
 */
import Component from '@ember/component'
import moment from 'moment'
import { computed } from '@ember/object'

/**
 * The record button component
 *
 * @class RecordButtonComponent
 * @extends Ember.Component
 * @public
 */
export default Component.extend({
  /**
   * Class name bindings
   *
   * @property {String[]} classNameBindings
   * @public
   */
  classNameBindings: ['active:recording'],

  /**
   * The start time
   *
   * @property {moment} startTime
   * @public
   */
  startTime: moment(),

  /**
   * Whether it is currently recording
   *
   * @property {Boolean} recording
   * @public
   */
  recording: false,

  active: computed('recording', 'activity.id', function() {
    return this.get('recording') && this.get('activity.id')
  }),

  /**
   * The actions for the record button component
   *
   * @property {Object} actions
   * @public
   */
  actions: {
    /**
     * Start recording
     *
     * @method start
     * @public
     */
    start() {
      this.get('on-start')()
    },

    /**
     * Stop recording
     *
     * @method stop
     * @public
     */
    stop() {
      this.get('on-stop')()
    }
  }
})
