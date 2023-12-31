<template>
  <div id="wrapper"
       :class="{'fixedTabs' : settings.stickBoardsOnTop}">
    <Row style="height: 100%;">
      <Col span="24" style="height: 100%;">
        <Tabs v-model="activeBoard"
              type="card"
              @on-click="saveActiveBoard"
              @dblclick.native="handleDblClick"
              :class="{'fixedTabs' : settings.stickBoardsOnTop}"
        >

          <Tab-pane v-for="board in boards"
                    :label="boardTabLabel(board.label, board.id)"
                    :name="board.id"
                    :key="board.id"
          >

            <board :board="board"/>

          </Tab-pane>
          <div slot="extra">
            <Tooltip content="Añadir nueva pestaña" placement="bottom-end" :transfer="true" :delay="500">
              <Button type="dashed"
                      id="add-new-board-btn"
                      @click="showNewBoardModal"
                      size="small"
                      icon="plus"
                      shape="circle"
                      style="margin-right: 5px;">
              </Button>
            </Tooltip>
            <Tooltip content="Ajustes" placement="bottom-end" :transfer="true" :delay="500">
              <Button type="dashed"
                      @click="showSettingsModal"
                      size="small"
                      icon="gear-a"
                      shape="circle"
                      style="margin-right: 12px; margin-top:2px;">
              </Button>
            </Tooltip>
          </div>
        </Tabs>
      </Col>
    </Row>
    <footer @click="open('https://github.com/shogtulakk')">
      Desarrollado by Shogtulakk@
    </footer>

    <input style="display: none;"
           id="inputForSettingsShortcut"
           v-shortkey="{win:['ctrl', ','], win2: ['alt' + ','], mac:['meta', ',']}" @shortkey="showSettingsModal">
    <input style="display: none;"
           id="inputForCreateNewBorad"
           v-shortkey="{win:['ctrl', 'shift', 'n'], win2: ['alt', 'shift', 'n'], mac:['meta', 'shift', 'n']}"
           @shortkey="showNewBoardModal">
    <input style="display: none;"
           id="inputForActivateNextTab"
           v-shortkey="{win: ['ctrl', 'shift', '}'], win2:['alt', 'shift', '}'], mac:['meta', 'shift', '}']}"
           @shortkey="activateNextTab">
    <input style="display: none;"
           id="inputForActivatePrevTab"
           v-shortkey="{win: ['ctrl', 'shift', '{'], win2:['alt', 'shift', '{'], mac:['meta', 'shift', '{']}"
           @shortkey="activatePreviousTab">
    <new-board-modal @newBoardSubmitted="loadBoards"></new-board-modal>
    <settings-modal></settings-modal>
    <move-to-board-modal></move-to-board-modal>
  </div>
</template>

<script>
  import boardsRepository from '@/repositories/boardsRepository'
  import settingsRepository from '@/repositories/settingsRepository'
  import Board from './board/Board'
  import MoveToBoardModal from './modals/MoveToBoardModal'
  import NewBoardModal from './modals/NewBoardModal.vue'
  import SettingsModal from './modals/settings/SettingsModal'
  import axios from 'axios'
  import {mapActions} from 'vuex'

  const version = require('electron').remote.app.getVersion()

  export default {
    components: {
      SettingsModal,
      NewBoardModal,
      Board,
      MoveToBoardModal
    },
    name: 'landing-page',
    data () {
      return {
        newItem: '',
        boardTabLabel: (boardLabel, boardId) => (h) => {
          const closer = this.isLastBoard ? '' : h('Icon', {
            'class': {'close-icon': true},
            props: {type: 'ios-close-empty'},
            nativeOn: {
              click: (event) => {
                event.stopPropagation()
                this.handleBoardRemove(boardLabel, boardId)
              }
            }
          })
          return h('div', [
            h('span', boardLabel),
            closer
          ])
        }
      }
    },
    computed: {
      isLastBoard () {
        return this.boards.length === 1
      },
      boards () {
        return this.$store.state.boards.boardsList
      },
      activeBoard: {
        set (value) {
          this.$store.dispatch('setActiveBoard', value)
        },
        get () {
          return this.$store.state.boards.activeBoard
        }
      },
      settings () {
        return this.$store.state.settings
      }
    },
    methods: {
      ...mapActions([
        'showNewBoardModal',
        'hideNewBoardModal',
        'showSettingsModal'
      ]),
      handleDblClick (event) {
        if (event.target.className === 'ivu-tabs-nav-scroll') {
          this.showNewBoardModal()
        }
      },
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      activateNextTab () {
        const activeTabDOM = document.querySelector('.ivu-tabs-tab-active')
        if (activeTabDOM.nextSibling && activeTabDOM.nextSibling.className === 'ivu-tabs-tab') {
          activeTabDOM.nextSibling.click()
        }
      },
      activatePreviousTab () {
        const activeTabDOM = document.querySelector('.ivu-tabs-tab-active')
        if (activeTabDOM.previousSibling && activeTabDOM.previousSibling.className === 'ivu-tabs-tab') {
          activeTabDOM.previousSibling.click()
        }
      },
      handleBoardRemove (boardLabel, boardId) {
        this.$Modal.confirm({
          title: `Eliminar pestaña '${boardLabel}' ?`,
          okText: 'OK',
          cancelText: 'Cancelar',
          content: `<p>Vas a remover la pestaña <strong>"${boardLabel}"</strong></p>
                    <p>y todos sus elementos seran eliminados, ¿Estas seguro?</p>`,
          onOk: () => {
            boardsRepository.removeBoard(boardId)
            this.activeBoard = boardsRepository.getFirstBoard().id
            this.loadBoards()
            this.$Message.info('Pestaña eliminada')
          }
        })
      },
      saveActiveBoard (boardId) {
        this.activeBoard = boardId
      },
      loadBoards () {
        this.$store.dispatch('fetchBoards')
      },
      importOldEntries () {
        if (!this.settings.wasImported) {
          boardsRepository.importOldEntries()
          settingsRepository.updateAppSettings({'wasImported': true})
        }
      },
      versionCheck () {
        axios.get('https://api.github.com/repos/czytelny/backlog/releases/latest')
          .then(({data}) => {
            if (`v${version}` !== data.tag_name) {
              this.$store.dispatch('showUpdateModal')
            }
          })
      }
    },
    created () {
      this.$store.dispatch('fetchSettings')
      this.versionCheck()
      this.importOldEntries()
      this.loadBoards()
      this.$store.dispatch('fetchActiveBoard')
      this.$nextTick().then(() => this.$bus.$emit('appInit', this.selectedTab))
    }
  }
</script>

<style>

  #wrapper {
    height: 100vh;
    width: 100vw;
  }

  #wrapper.fixedTabs {
    margin-top: 35px;
  }

  div.fixedTabs .ivu-tabs-bar {
    position: fixed;
    top: 37px;
    z-index: 100;
    background-color: #fff;
    width: 98vw;
    box-shadow: 0 0 0 6px #ffffff;
    left: 7px;
  }

  .ivu-tabs-tab-active .close-icon {
    opacity: 1;
  }

  .ivu-tabs-tab:hover .close-icon {
    display: inline-block;
    opacity: 1;
  }

  .close-icon {
    opacity: 0;
    transition: opacity .3s;
    position: absolute;
    padding-left: 3px;
  }

  footer {
    position: fixed;
    bottom: 0;
    background-color: #5a6376;
    color: white;
    text-align: center;
    width: 100%;
    cursor: pointer;
    opacity: .4;
  }

  .ivu-tabs-bar {
    user-select: none;
  }
</style>
