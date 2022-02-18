import { IMenuItem, IMainMenu, ISubMenu } from 'interfaces/Menu.interface'

type State = {
  showMenu: boolean
  activeMenu: IMainMenu | ISubMenu
  cursor: number
  current: number | null
  searchResult: IMenuItem[] | []
}

type Action =
  | { type: 'UP_PRESS' | 'DOWN_PRESS' }
  | { type: 'ENTER_PRESS' | 'OUTER_CLICK'; payload: { mainMenu: IMainMenu } }
  | { type: 'ESC_PRESS'; payload: { mainMenu: IMainMenu; searchRef: React.RefObject<HTMLInputElement> } }
  | { type: 'HOVERED'; payload: { hovered: IMenuItem } }
  | { type: 'SEARCH_CHANGE' }

const findCurrentMenu = (content: IMenuItem[], property: string) => {
  return content.findIndex((item) => item.name.toLowerCase() === property)
}

const findCurrentOption = (menu: IMainMenu | ISubMenu) => {
  return menu.content.findIndex((item) => item.name === localStorage.getItem(menu.property!))
}

const findCurrent = (state: State, payload: { mainMenu: IMainMenu }) => {
  return state.activeMenu.content[state.cursor].goToMenu
    ? findCurrentOption(state.activeMenu.content[state.cursor].goToMenu!)
    : state.activeMenu.property
    ? findCurrentMenu(payload.mainMenu.content, state.activeMenu.property!)
    : state.cursor
}

const callAction = (activeMenu: IMainMenu | ISubMenu, index: number) => {
  return activeMenu.action?.call(activeMenu, activeMenu.content[index].name?.toLowerCase())
}

export default function MenuReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SEARCH_CHANGE':
      state.searchResult?.length && state.activeMenu.action && callAction(state.activeMenu, 0)

      return {
        ...state,
        activeMenu: state.searchResult ? { ...state.activeMenu, content: state.searchResult } : state.activeMenu,
        cursor: 0
      }

    case 'OUTER_CLICK':
      state.searchResult?.length && state.activeMenu.action && callAction(state.activeMenu, state.current || 0)

      return {
        ...state,
        showMenu: false,
        activeMenu: action.payload.mainMenu,
        searchResult: []
      }

    case 'ESC_PRESS':
      state.searchResult?.length && state.activeMenu.action && callAction(state.activeMenu, state.current || 0)

      if (action.payload.searchRef.current) action.payload.searchRef.current.value = ''

      return {
        ...state,
        showMenu: state.activeMenu.action ? state.showMenu : !state.showMenu,
        cursor: state.activeMenu.action
          ? findCurrentMenu(action.payload.mainMenu.content, state.activeMenu.property!)
          : 0,
        activeMenu: state.activeMenu.action ? action.payload.mainMenu : state.activeMenu
      }

    case 'UP_PRESS':
      callAction(state.activeMenu, state.cursor > 0 ? state.cursor - 1 : state.activeMenu.content.length - 1)

      return {
        ...state,
        cursor: state.cursor > 0 ? state.cursor - 1 : state.activeMenu.content.length - 1
      }

    case 'DOWN_PRESS':
      callAction(state.activeMenu, state.cursor < state.activeMenu.content.length - 1 ? state.cursor + 1 : 0)

      return {
        ...state,
        cursor: state.cursor < state.activeMenu.content.length - 1 ? state.cursor + 1 : 0
      }

    case 'ENTER_PRESS':
      return {
        ...state,
        activeMenu: state.activeMenu.content[state.cursor].goToMenu || action.payload.mainMenu,
        cursor: findCurrent(state, action.payload),
        current: findCurrent(state, action.payload)
      }

    case 'HOVERED':
      callAction(state.activeMenu, action.payload.hovered.id)

      return {
        ...state,
        cursor: state.activeMenu.content.indexOf(action.payload.hovered)
      }

    default:
      throw new Error()
  }
}
