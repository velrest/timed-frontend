import { expect } from 'chai'
import { describe, it } from 'mocha'
import { setupComponentTest } from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'
import { find, click } from 'ember-native-dom-helpers'

describe('Integration | Component | filter sidebar/group', function() {
  setupComponentTest('filter-sidebar/group', {
    integration: true
  })

  it('renders', function() {
    this.render(hbs`
      {{#filter-sidebar/group label='Group'}}
        Group content
      {{/filter-sidebar/group}}
    `)

    expect(find('.filter-sidebar-group-label').innerHTML).to.contain('Group')
    expect(find('.filter-sidebar-group-body').innerHTML).to.contain(
      'Group content'
    )
  })

  it('can be toggled', function() {
    this.render(hbs`
      {{#filter-sidebar/group label='Group'}}
        Group content
      {{/filter-sidebar/group}}
    `)

    expect(find('.filter-sidebar-group--expanded')).to.not.be.ok

    click('.filter-sidebar-group-label')

    expect(find('.filter-sidebar-group--expanded')).to.be.ok

    click('.filter-sidebar-group-label')

    expect(find('.filter-sidebar-group--expanded')).to.not.be.ok
  })
})
