import { Ability } from 'ember-can'
import { computed } from '@ember/object'

export default Ability.extend({
  canRead: computed(
    'user.{id,isSuperuser}',
    'model.{id,supervisors}',
    function() {
      return (
        this.get('user.isSuperuser') ||
        this.get('user.id') === this.get('model.id') ||
        this.get('model.supervisors')
          .mapBy('id')
          .includes(this.get('user.id'))
      )
    }
  )
})
