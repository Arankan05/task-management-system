import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from './storage'
import authReducer from './slices/authSlice'
import workspacesReducer from './slices/workspacesSlice'
import projectsReducer from './slices/projectsSlice'
import tasksReducer from './slices/tasksSlice'
import filtersReducer from './slices/filtersSlice'
import settingsReducer from './slices/settingsSlice'
import { setupApiInterceptors } from '../services/api'

const settingsPersistConfig = {
  key: 'settings',
  storage,
}

const rootReducer = combineReducers({
  auth: authReducer,
  workspaces: workspacesReducer,
  projects: projectsReducer,
  tasks: tasksReducer,
  filters: filtersReducer,
  settings: persistReducer(settingsPersistConfig, settingsReducer),
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

setupApiInterceptors(store)
